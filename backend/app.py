#!/usr/bin/env python3
"""Serwer API i statyczny frontend dla eksploracji flag."""

from __future__ import annotations

import json
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from groq_client import enrich_clusters
from model_runtime import embedding_3d_map, interpolate_codes, reconstruction_trace

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
FLAGS_DIR = DATA_DIR / "flags"
FRONTEND_DIR = ROOT.parent / "frontend"
METADATA_PATH = DATA_DIR / "metadata.json"

app = FastAPI(title="Eksploracja flag świata", version="1.1.0")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
)


def _load_metadata() -> dict:
  if not METADATA_PATH.exists():
    raise HTTPException(
      status_code=503,
      detail="Brak danych. Uruchom najpierw: python train.py",
    )
  with open(METADATA_PATH, encoding="utf-8") as f:
    return json.load(f)


def _save_metadata(meta: dict) -> None:
  with open(METADATA_PATH, "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)


@app.get("/api/flags")
def api_flags():
  return _load_metadata()["flags"]


@app.get("/api/metadata")
def api_metadata():
  return _load_metadata()


@app.get("/api/embedding-3d")
def api_embedding_3d():
  try:
    return embedding_3d_map()
  except FileNotFoundError as e:
    raise HTTPException(status_code=503, detail=str(e)) from e


def _ensure_country_coords() -> dict[str, dict]:
  path = DATA_DIR / "country_coords.json"
  meta = _load_metadata()
  expected = len(meta["flags"])
  min_expected = max(1, int(expected * 0.5))

  coords: dict[str, dict] = {}
  if path.exists():
    try:
      with open(path, encoding="utf-8") as f:
        cached = json.load(f)
      if isinstance(cached, dict):
        for code, c in cached.items():
          try:
            lat = float(c["lat"])
            lng = float(c["lng"])
          except Exception:
            continue
          coords[str(code).upper()] = {"lat": lat, "lng": lng}
    except Exception:
      coords = {}

  # Merge any local coords present in metadata
  for f in meta["flags"]:
    if f.get("lat") is not None and f.get("lng") is not None:
      coords[f["code"].upper()] = {"lat": float(f["lat"]), "lng": float(f["lng"])}

  # If cache is too small, refresh from REST Countries API.
  if len(coords) < min_expected:
    try:
      r = requests.get(
        "https://restcountries.com/v3.1/all?fields=cca2,latlng",
        timeout=60,
      )
      r.raise_for_status()
      for c in r.json():
        code = (c.get("cca2") or "").upper()
        ll = c.get("latlng") or []
        if code and len(ll) >= 2:
          coords[code] = {"lat": float(ll[0]), "lng": float(ll[1])}
    except Exception:
      pass

  with open(path, "w", encoding="utf-8") as f:
    json.dump(coords, f, ensure_ascii=False)
  return coords


@app.get("/api/country-coords")
def api_country_coords():
  return _ensure_country_coords()


@app.get("/api/training-history")
def api_training_history():
  path = DATA_DIR / "training_history.json"
  if not path.exists():
    raise HTTPException(status_code=404, detail="Brak historii treningu")
  with open(path, encoding="utf-8") as f:
    return json.load(f)


@app.get("/api/palette")
def api_palette():
  path = DATA_DIR / "ui_palette.json"
  if path.exists():
    with open(path, encoding="utf-8") as f:
      return json.load(f)
  meta = _load_metadata()
  colors = list({f.get("dominant_color", "#457b9d") for f in meta["flags"]})[:8]
  return {"colors": colors}


@app.get("/api/flag/{code}")
def api_flag_image(code: str):
  path = FLAGS_DIR / f"{code.lower()}.png"
  if not path.exists():
    raise HTTPException(status_code=404, detail="Nie znaleziono flagi")
  return FileResponse(path, media_type="image/png")


@app.get("/api/recon/{filename:path}")
def api_recon_image(filename: str):
  if ".." in filename:
    raise HTTPException(status_code=400, detail="Nieprawidłowa nazwa pliku")
  safe = Path(filename).name
  path = DATA_DIR / safe
  if not path.exists() and not safe.startswith("recon_"):
    path = DATA_DIR / f"recon_{safe}"
  if not path.exists():
    raise HTTPException(status_code=404, detail="Nie znaleziono obrazu")
  return FileResponse(path, media_type="image/png")


@app.get("/api/interpolate")
def api_interpolate(
  a: str = Query(..., min_length=2, max_length=2),
  b: str = Query(..., min_length=2, max_length=2),
  steps: int = Query(9, ge=2, le=24),
):
  try:
    return interpolate_codes(a, b, steps)
  except KeyError as e:
    raise HTTPException(status_code=404, detail=str(e)) from e
  except FileNotFoundError as e:
    raise HTTPException(status_code=503, detail=str(e)) from e


@app.get("/api/reconstruction-trace/{code}")
def api_reconstruction_trace(code: str):
  try:
    return reconstruction_trace(code)
  except FileNotFoundError as e:
    raise HTTPException(status_code=404, detail=f"Nie znaleziono flagi: {code}") from e
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Błąd rekonstrukcji: {e}") from e


@app.post("/api/clusters/enrich-descriptions")
def api_enrich_descriptions():
  meta = _load_metadata()
  code_to_country = {f["code"].lower(): f["country"] for f in meta["flags"]}
  meta["clusters"] = enrich_clusters(meta["clusters"], code_to_country)
  _save_metadata(meta)
  return {"ok": True, "clusters": meta["clusters"]}


@app.get("/api/export/clusters.csv")
def export_clusters_csv():
  meta = _load_metadata()
  lines = ["kod_kraju,kraj,klaster"]
  for f in meta["flags"]:
    lines.append(f"{f['code']},{f['country']},{f['cluster']}")
  content = "\n".join(lines)
  return JSONResponse(
    content={"csv": content, "filename": "klastry_flag.csv"},
  )


@app.get("/health")
def health():
  weights = ROOT / "model" / "autoencoder.pt"
  return {
    "status": "ok",
    "has_data": METADATA_PATH.exists(),
    "has_model": weights.exists(),
  }


if FRONTEND_DIR.exists():
  app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
