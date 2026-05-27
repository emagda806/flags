# World Flags Explorer

Interactive web app for exploring visual similarity between world flags using:
- a convolutional autoencoder,
- latent embeddings,
- K-Means clustering,
- UMAP / 3D projections for visualization.

🌍 🏳️‍🌈 🇵🇱 🇬🇧

The UI supports two languages (English and Polish), with English as the default.

## Architecture At A Glance

```mermaid
flowchart LR
  A[Flag images] --> B[Autoencoder encoder]
  B --> C[Latent vectors z]
  C --> D[K-Means clusters]
  C --> E[UMAP 2D/3D projection]
  D --> F[Cluster metadata]
  E --> G[Interactive frontend views]
  F --> G
```

### Frontend Experience

- `Explore` mode: cloud + globe for visual navigation
- `Implementation` mode: training curve, reconstruction stages, embedding maps
- Guided onboarding (PL/EN) with highlighted UI sections
- Mobile-tuned controls and zoom behavior for cluster exploration

## Requirements

- Python 3.10+
- Internet connection (required while training to download source flag images)

## Local Run (Backend + Frontend)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Training (downloads flags and trains the model; takes a few minutes on CPU)
python train.py

# API server + frontend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Open: `http://localhost:8000`

## Deploy to GitHub Pages (Static)

This repository includes a workflow: `Deploy to GitHub Pages`.
It publishes `frontend/` and copies static assets from `backend/data/` into `frontend/data/`.

### Steps

1. Push the repository to GitHub (`main` branch).
2. In GitHub: **Settings -> Pages -> Source: GitHub Actions**.
3. Wait for the workflow to finish.
4. Your app will be available at:
   `https://<your-username>.github.io/<repo-name>/`

### Static-mode notes

- GitHub Pages does not run the FastAPI backend.
- Flags are loaded from external CDN: `flagcdn.com`.
- Reconstruction view works from pre-generated static assets (`frontend/data/recon_*.png`).

## Project Structure

- `backend/train.py` — data pipeline and model training
- `backend/app.py` — FastAPI application
- `backend/model/` — autoencoder weights and config
- `backend/data/` — training artifacts, metadata, cached assets
- `frontend/` — static HTML/CSS/JS frontend

## API (backend mode)

- `GET /api/flags` — flags list with clusters and 2D embeddings
- `GET /api/metadata` — full metadata (clusters, architecture, reconstructions)
- `GET /api/flag/{code}` — flag image
- `GET /api/export/clusters.csv` — clusters export
