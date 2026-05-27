#!/usr/bin/env python3
"""
Pobiera flagi krajów, trenuje konwolucyjny autoenkoder,
ekstrahuje embeddingi, klasteryzuje (K-Means) i zapisuje artefakty do data/ i model/.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import requests
import torch
import torch.nn as nn
from PIL import Image
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from torch.utils.data import DataLoader, TensorDataset
from tqdm import tqdm

from groq_client import enrich_clusters
from model_def import IMG_SIZE, LATENT_DIM, MODEL_VERSION, ConvAutoencoder

try:
  import umap
  HAS_UMAP = True
except ImportError:
  HAS_UMAP = False

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
FLAGS_DIR = DATA_DIR / "flags"
MODEL_DIR = ROOT / "model"
N_CLUSTERS = 12
EPOCHS = 100
BATCH_SIZE = 32
LR = 1e-3
MIN_COUNTRIES = 50
FLAG_CDN = "https://flagcdn.com/w160/{code}.png"
REST_COUNTRIES = "https://restcountries.com/v3.1/all?fields=name,cca2,translations,flags,latlng"


def fetch_countries() -> list[dict]:
  r = requests.get(REST_COUNTRIES, timeout=60)
  r.raise_for_status()
  countries = []
  for c in r.json():
    code = c.get("cca2")
    if not code or len(code) != 2:
      continue
    name_pl = (
      (c.get("translations") or {}).get("pol", {}).get("common")
      or c["name"]["common"]
    )
    latlng = c.get("latlng") or []
    countries.append({
      "code": code.lower(),
      "name_pl": name_pl,
      "name_en": c["name"]["common"],
      "lat": float(latlng[0]) if len(latlng) >= 2 else None,
      "lng": float(latlng[1]) if len(latlng) >= 2 else None,
    })
  countries.sort(key=lambda x: x["name_pl"])
  return countries


def download_flag(code: str, dest: Path) -> bool:
  url = FLAG_CDN.format(code=code)
  try:
    resp = requests.get(url, timeout=15)
    if resp.status_code != 200:
      return False
    img = Image.open(__import__("io").BytesIO(resp.content)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.Resampling.LANCZOS)
    img.save(dest, "PNG")
    return True
  except Exception:
    return False


def load_tensor_from_flags(codes: list[str]) -> np.ndarray:
  tensors = []
  for code in codes:
    path = FLAGS_DIR / f"{code}.png"
    arr = np.array(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0
    tensors.append(arr.transpose(2, 0, 1))
  return np.stack(tensors, axis=0)


def dominant_color_hex(img_path: Path) -> str:
  img = Image.open(img_path).convert("RGB").resize((16, 16))
  arr = np.array(img).reshape(-1, 3).astype(float)
  mean = arr.mean(axis=0).astype(int)
  return "#{:02x}{:02x}{:02x}".format(*mean)


def cluster_visual_traits(codes: list[str], labels: np.ndarray, k: int) -> list[dict]:
  traits = []
  for cluster_id in range(k):
    mask = labels == cluster_id
    cluster_codes = [codes[i] for i in range(len(codes)) if mask[i]]
    if not cluster_codes:
      traits.append({"mean_color": "#888888", "description": "brak danych"})
      continue
    colors = []
    for code in cluster_codes:
      path = FLAGS_DIR / f"{code}.png"
      if path.exists():
        img = np.array(Image.open(path).convert("RGB"), dtype=float) / 255.0
        colors.append(img.mean(axis=(0, 1)))
    mean_rgb = np.mean(colors, axis=0) if colors else np.array([0.5, 0.5, 0.5])
    hex_color = "#{:02x}{:02x}{:02x}".format(
      int(mean_rgb[0] * 255), int(mean_rgb[1] * 255), int(mean_rgb[2] * 255)
    )
    r, g, b = mean_rgb
    parts = []
    if r > 0.55:
      parts.append("czerwone tony")
    if g > 0.55:
      parts.append("zielone tony")
    if b > 0.55:
      parts.append("niebieskie tony")
    brightness = mean_rgb.mean()
    if brightness > 0.7:
      parts.append("jasne tło")
    elif brightness < 0.35:
      parts.append("ciemne tło")
    if not parts:
      parts.append("mieszane kolory")
    traits.append({
      "mean_color": hex_color,
      "description": ", ".join(parts[:3]),
    })
  return traits


def compute_neighbors(latent: np.ndarray, labels: np.ndarray, codes: list[str], k: int = 5) -> dict[str, list[str]]:
  from sklearn.metrics.pairwise import euclidean_distances
  dist = euclidean_distances(latent)
  neighbors = {}
  for i, code in enumerate(codes):
    same = labels == labels[i]
    order = np.argsort(dist[i])
    nb = []
    for j in order:
      if j == i:
        continue
      if same[j]:
        nb.append(codes[j])
      if len(nb) >= k:
        break
    neighbors[code] = nb
  return neighbors


def reduce_2d(latent: np.ndarray) -> np.ndarray:
  return reduce_nd(latent, 2)


def reduce_3d(latent: np.ndarray) -> np.ndarray:
  return reduce_nd(latent, 3)


def reduce_nd(latent: np.ndarray, n_components: int) -> np.ndarray:
  n = latent.shape[0]
  if HAS_UMAP and n >= 15:
    reducer = umap.UMAP(
      n_components=n_components,
      random_state=42,
      n_neighbors=min(15, n - 1),
    )
    return reducer.fit_transform(latent)
  perplexity = min(30, max(5, n // 4))
  tsne = TSNE(
    n_components=n_components,
    random_state=42,
    perplexity=perplexity,
    max_iter=1000,
  )
  return tsne.fit_transform(latent)


def train_model(X: torch.Tensor, device: torch.device) -> tuple[ConvAutoencoder, list[float]]:
  model = ConvAutoencoder(LATENT_DIM, IMG_SIZE).to(device)
  opt = torch.optim.Adam(model.parameters(), lr=LR)
  scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    opt, mode="min", factor=0.5, patience=10, min_lr=1e-5
  )
  criterion = nn.MSELoss()
  loader = DataLoader(TensorDataset(X), batch_size=BATCH_SIZE, shuffle=True)
  history = []
  model.train()
  for epoch in range(EPOCHS):
    epoch_loss = 0.0
    n_batches = 0
    for (batch,) in loader:
      batch = batch.to(device)
      opt.zero_grad()
      recon, _ = model(batch)
      loss = criterion(recon, batch)
      loss.backward()
      opt.step()
      epoch_loss += loss.item()
      n_batches += 1
    avg = epoch_loss / max(n_batches, 1)
    scheduler.step(avg)
    history.append(avg)
    lr = opt.param_groups[0]["lr"]
    print(f"Epoka {epoch + 1}/{EPOCHS} — strata: {avg:.6f} — lr: {lr:.2e}")
  return model, history


def main():
  DATA_DIR.mkdir(parents=True, exist_ok=True)
  FLAGS_DIR.mkdir(parents=True, exist_ok=True)
  MODEL_DIR.mkdir(parents=True, exist_ok=True)

  print("Pobieranie listy krajów…")
  countries = fetch_countries()
  print(f"Znaleziono {len(countries)} krajów.")

  downloaded = []
  for c in tqdm(countries, desc="Pobieranie flag"):
    dest = FLAGS_DIR / f"{c['code']}.png"
    if dest.exists() or download_flag(c["code"], dest):
      downloaded.append(c)

  if len(downloaded) < MIN_COUNTRIES:
    print(f"Błąd: pobrano tylko {len(downloaded)} flag (wymagane min. {MIN_COUNTRIES}).")
    sys.exit(1)

  codes = [c["code"] for c in downloaded]
  code_to_country = {c["code"]: c["name_pl"] for c in downloaded}
  print(f"Przetwarzanie {len(codes)} obrazów (normalizacja [0,1])…")
  X_np = load_tensor_from_flags(codes)
  X = torch.from_numpy(X_np).float()

  device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  print(f"Trening na: {device} | latent={LATENT_DIM} | epoki={EPOCHS}")
  model, history = train_model(X, device)
  model.eval()

  with torch.no_grad():
    recon, latent_t = model(X.to(device))
    latent = latent_t.cpu().numpy()
    recon_np = recon.cpu().numpy()

  print("Klasteryzacja K-Means…")
  kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
  labels = kmeans.fit_predict(latent)

  print("Redukcja wymiarów do 2D i 3D…")
  emb_2d = reduce_2d(latent)
  emb_3d = reduce_3d(latent)
  neighbors_map = compute_neighbors(latent, labels, codes)

  cluster_traits = cluster_visual_traits(codes, labels, N_CLUSTERS)
  clusters_table = []
  for cid in range(N_CLUSTERS):
    members = [codes[i] for i in range(len(codes)) if labels[i] == cid]
    clusters_table.append({
      "id": cid,
      "count": len(members),
      "sample_codes": members[:8],
      "traits": cluster_traits[cid],
    })

  print("Opisy klastrów (GROQ, jeśli skonfigurowane)…")
  clusters_table = enrich_clusters(clusters_table, code_to_country)

  CLUSTER_COLORS = [
    "#8b4513", "#2e6b8a", "#3d7a5c", "#b8956a", "#7b5ea7", "#c45c4a",
    "#5a8f7b", "#9b6b4f", "#4a6fa5", "#a65d7a", "#6b8e23", "#8b6914",
  ]

  flags_meta = []
  for i, c in enumerate(downloaded):
    code = c["code"]
    entry = {
      "country": c["name_pl"],
      "code": code.upper(),
      "cluster": int(labels[i]),
      "cluster_color": CLUSTER_COLORS[int(labels[i]) % len(CLUSTER_COLORS)],
      "neighbors": [n.upper() for n in neighbors_map[code]],
      "embedding_2d": [float(emb_2d[i, 0]), float(emb_2d[i, 1])],
      "embedding_3d": [float(emb_3d[i, 0]), float(emb_3d[i, 1]), float(emb_3d[i, 2])],
      "dominant_color": dominant_color_hex(FLAGS_DIR / f"{code}.png"),
    }
    if c.get("lat") is not None and c.get("lng") is not None:
      entry["lat"] = c["lat"]
      entry["lng"] = c["lng"]
    flags_meta.append(entry)

  torch.save(model.state_dict(), MODEL_DIR / "autoencoder.pt")
  with open(MODEL_DIR / "model_config.json", "w", encoding="utf-8") as f:
    json.dump({
      "latent_dim": LATENT_DIM,
      "img_size": IMG_SIZE,
      "version": MODEL_VERSION,
    }, f)

  arch = {
    "input": f"{IMG_SIZE}×{IMG_SIZE}×3 RGB, normalizacja ÷255",
    "encoder": [
      "Conv2d(3→64, 3×3) + BN + ReLU → 64×64",
      "Conv2d(64→128, 4×4 s=2) + BN + ReLU → 32×32",
      "Conv2d(128→256, 3×3) + BN + ReLU → 32×32",
      "Conv2d(256→256, 4×4 s=2) + BN + ReLU → 16×16",
      "Conv2d(256→256, 3×3) + BN + ReLU → 16×16",
      f"Linear(65536 → {LATENT_DIM}) — bottleneck",
    ],
    "decoder": [
      f"Linear({LATENT_DIM} → 65536)",
      "ConvTranspose2d + Conv2d (256→128→64→3) + Sigmoid → 64×64",
    ],
    "loss": "MSE",
    "latent_dim": LATENT_DIM,
    "epochs": EPOCHS,
    "n_countries": len(codes),
    "n_clusters": N_CLUSTERS,
    "scheduler": "ReduceLROnPlateau(patience=10, factor=0.5)",
  }

  np.savez(
    DATA_DIR / "embeddings.npz",
    latent=latent,
    embedding_2d=emb_2d,
    embedding_3d=emb_3d,
    labels=labels,
    codes=np.array(codes),
  )

  with open(DATA_DIR / "training_history.json", "w", encoding="utf-8") as f:
    json.dump({"loss": history, "epochs": list(range(1, len(history) + 1))}, f)

  # Przykładowe pary do porównania rekonstrukcji (opcjonalnie w UI)
  recon_samples = []
  for code in ["pl", "de", "af", "mx"]:
    if code not in codes:
      continue
    idx = codes.index(code)
    orig = (X_np[idx].transpose(1, 2, 0) * 255).astype(np.uint8)
    rec = (recon_np[idx].transpose(1, 2, 0) * 255).astype(np.uint8)
    Image.fromarray(orig).save(DATA_DIR / f"recon_{code}_orig.png")
    Image.fromarray(rec).save(DATA_DIR / f"recon_{code}_rec.png")
    recon_samples.append({
      "code": code.upper(),
      "country": code_to_country[code],
      "orig_url": f"/api/recon/recon_{code}_orig.png",
      "rec_url": f"/api/recon/recon_{code}_rec.png",
    })

  # Domyślna para do interpolacji latentnej
  default_interp = {"a": "PL", "b": "DE"}
  if "pl" not in codes or "de" not in codes:
    default_interp = {"a": codes[0].upper(), "b": codes[min(1, len(codes) - 1)].upper()}

  metadata = {
    "flags": flags_meta,
    "clusters": clusters_table,
    "cluster_colors": CLUSTER_COLORS[:N_CLUSTERS],
    "architecture": arch,
    "reconstructions": recon_samples,
    "default_interpolation": default_interp,
    "reduction_method": "UMAP" if HAS_UMAP else "t-SNE",
  }

  with open(DATA_DIR / "metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

  palette = list({f["dominant_color"] for f in flags_meta})[:8]
  with open(DATA_DIR / "ui_palette.json", "w", encoding="utf-8") as f:
    json.dump({"colors": palette}, f)

  print(f"\nGotowe. {len(codes)} flag, {N_CLUSTERS} klastrów.")
  print(f"Zapisano: {MODEL_DIR / 'autoencoder.pt'}, {DATA_DIR / 'metadata.json'}")


if __name__ == "__main__":
  main()
