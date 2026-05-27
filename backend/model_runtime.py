"""Ładowanie modelu i operacje na przestrzeni latentnej."""

from __future__ import annotations

import base64
import io
import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image

from model_def import ConvAutoencoder, IMG_SIZE, LATENT_DIM, MODEL_VERSION

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "model"
DATA_DIR = ROOT / "data"
FLAGS_DIR = DATA_DIR / "flags"

_model: ConvAutoencoder | None = None
_latents: np.ndarray | None = None
_codes: list[str] | None = None


def model_config() -> dict:
  path = MODEL_DIR / "model_config.json"
  if path.exists():
    with open(path, encoding="utf-8") as f:
      return json.load(f)
  return {"latent_dim": LATENT_DIM, "img_size": IMG_SIZE, "version": MODEL_VERSION}


def get_model() -> ConvAutoencoder:
  global _model
  if _model is not None:
    return _model
  cfg = model_config()
  weights = MODEL_DIR / "autoencoder.pt"
  if not weights.exists():
    raise FileNotFoundError("Brak wag modelu. Uruchom train.py")
  m = ConvAutoencoder(cfg.get("latent_dim", LATENT_DIM), cfg.get("img_size", IMG_SIZE))
  m.load_state_dict(torch.load(weights, map_location="cpu", weights_only=True))
  m.eval()
  _model = m
  return _model


def _load_embeddings() -> tuple[np.ndarray, list[str]]:
  global _latents, _codes
  if _latents is not None and _codes is not None:
    return _latents, _codes
  path = DATA_DIR / "embeddings.npz"
  if not path.exists():
    raise FileNotFoundError("Brak embeddings.npz")
  data = np.load(path)
  _latents = data["latent"]
  _codes = [str(c).lower() for c in data["codes"]]
  return _latents, _codes


def latent_for_code(code: str) -> np.ndarray:
  code = code.lower()
  latents, codes = _load_embeddings()
  try:
    idx = codes.index(code)
  except ValueError:
    raise KeyError(f"Nieznany kod kraju: {code}")
  return latents[idx]


def tensor_to_png_b64(tensor: torch.Tensor, out_w: int = 160, out_h: int = 107) -> str:
  arr = tensor.detach().cpu().numpy()
  if arr.ndim == 4:
    arr = arr[0]
  arr = (arr.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
  img = Image.fromarray(arr).resize((out_w, out_h), Image.Resampling.LANCZOS)
  buf = io.BytesIO()
  img.save(buf, format="PNG")
  return base64.b64encode(buf.getvalue()).decode("ascii")


def _feature_to_png_b64(tensor: torch.Tensor, out_w: int = 160, out_h: int = 107) -> str:
  arr = tensor.detach().cpu().numpy()
  if arr.ndim == 4:
    arr = arr[0]
  if arr.ndim == 2:
    arr = np.expand_dims(arr, axis=0)
  if arr.ndim != 3:
    raise ValueError("Nieobsługiwany wymiar tensora cech")

  c, h, w = arr.shape
  if c >= 3:
    rgb = arr[:3]
  else:
    mean_map = arr.mean(axis=0, keepdims=True)
    rgb = np.repeat(mean_map, 3, axis=0)

  # Per-channel normalization to make intermediate activations visible.
  out = np.empty_like(rgb, dtype=np.float32)
  for i in range(3):
    ch = rgb[i]
    mn = float(ch.min())
    mx = float(ch.max())
    if mx - mn < 1e-8:
      out[i] = np.zeros_like(ch)
    else:
      out[i] = (ch - mn) / (mx - mn)

  out = (out.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
  img = Image.fromarray(out).resize((out_w, out_h), Image.Resampling.LANCZOS)
  buf = io.BytesIO()
  img.save(buf, format="PNG")
  return base64.b64encode(buf.getvalue()).decode("ascii")


def _load_flag_tensor(code: str) -> torch.Tensor:
  path = FLAGS_DIR / f"{code.lower()}.png"
  if not path.exists():
    raise FileNotFoundError(code)
  img = Image.open(path).convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.Resampling.LANCZOS)
  arr = np.asarray(img).astype(np.float32) / 255.0
  arr = np.transpose(arr, (2, 0, 1))  # HWC -> CHW
  return torch.from_numpy(arr).unsqueeze(0)


def interpolate_codes(code_a: str, code_b: str, steps: int = 9) -> dict:
  steps = max(2, min(steps, 24))
  za = latent_for_code(code_a)
  zb = latent_for_code(code_b)
  model = get_model()
  frames = []
  t_values = []
  with torch.no_grad():
    for i in range(steps):
      t = i / (steps - 1)
      z = torch.from_numpy(((1 - t) * za + t * zb).astype(np.float32)).unsqueeze(0)
      recon = model.decode(z)
      frames.append(tensor_to_png_b64(recon, 160, 107))
      t_values.append(round(t, 4))
  return {
    "a": code_a.upper(),
    "b": code_b.upper(),
    "steps": steps,
    "frames": frames,
    "t_values": t_values,
  }


def embedding_3d_map() -> dict[str, list[float]]:
  """Mapa kod kraju → [x,y,z] z cache lub stabilnej projekcji 3D."""
  cache = DATA_DIR / "embedding_3d.json"
  if cache.exists():
    try:
      with open(cache, encoding="utf-8") as f:
        cached = json.load(f)
      if isinstance(cached, dict) and cached:
        return cached
    except Exception:
      pass

  latent, codes = _load_embeddings()
  n = latent.shape[0]
  x = latent.astype(np.float64, copy=False)
  x = x - x.mean(axis=0, keepdims=True)

  # Stable default: PCA 3D (or safe SVD fallback) to avoid runtime crashes
  # from optional manifold libs.
  try:
    from sklearn.decomposition import PCA
    emb = PCA(n_components=3, random_state=42).fit_transform(x)
  except Exception:
    u, s, _ = np.linalg.svd(x, full_matrices=False)
    k = min(3, u.shape[1])
    emb = u[:, :k] * s[:k]
    if k < 3:
      emb = np.pad(emb, ((0, 0), (0, 3 - k)), mode="constant")

  # Normalize to a comparable cube for frontend camera controls.
  span = np.max(np.abs(emb))
  if span > 0:
    emb = emb / span

  out = {
    codes[i].upper(): [float(emb[i, 0]), float(emb[i, 1]), float(emb[i, 2])]
    for i in range(len(codes))
  }
  with open(cache, "w", encoding="utf-8") as f:
    json.dump(out, f)
  return out


def reconstruction_trace(code: str) -> dict:
  model = get_model()
  x = _load_flag_tensor(code)

  stages: list[dict] = []
  stages.append({
    "name": "Wejście",
    "shape": "3×64×64",
    "image_b64": tensor_to_png_b64(x, 160, 107),
  })

  with torch.no_grad():
    h = model.encoder(x)
    stages.append({
      "name": "Po enkoderze",
      "shape": "256×16×16",
      "image_b64": _feature_to_png_b64(h, 160, 107),
    })

    z = model.fc_enc(h.view(h.size(0), -1))
    stages.append({
      "name": "Wektor latentny z",
      "shape": f"{z.shape[-1]}D",
      "image_b64": _feature_to_png_b64(h, 160, 107),
    })

    dec = model.fc_dec(z).view(-1, 256, 16, 16)
    stages.append({
      "name": "Start dekodera",
      "shape": "256×16×16",
      "image_b64": _feature_to_png_b64(dec, 160, 107),
    })

    cur = dec
    decoder = model.decoder
    # Key visual milestones in decoder.
    milestones = {
      0: ("Po ConvT #1", None),
      3: ("Po ConvT #2", None),
      6: ("Po ConvT #3", None),
      9: ("RGB przed Sigmoid", tensor_to_png_b64),
      10: ("Wyjście (rekonstrukcja)", tensor_to_png_b64),
    }
    for i, layer in enumerate(decoder):
      cur = layer(cur)
      if i in milestones:
        name, rgb_fn = milestones[i]
        render_fn = rgb_fn or _feature_to_png_b64
        stages.append({
          "name": name,
          "shape": "×".join(map(str, cur.shape[1:])),
          "image_b64": render_fn(cur, 160, 107),
        })

  return {"code": code.upper(), "stages": stages}


def flag_image_b64(code: str, w: int = 160, h: int = 107) -> str:
  path = FLAGS_DIR / f"{code.lower()}.png"
  if not path.exists():
    raise FileNotFoundError(code)
  img = Image.open(path).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
  buf = io.BytesIO()
  img.save(buf, format="PNG")
  return base64.b64encode(buf.getvalue()).decode("ascii")
