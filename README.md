# Eksploracja flag świata

Aplikacja webowa (PL) do eksploracji flag z autoenkoderem i klasteryzacją K-Means.

## Wymagania

- Python 3.10+
- Połączenie z internetem (pobieranie flag przy treningu)

## Instalacja i uruchomienie

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Trening (pobiera flagi, uczy model — kilka minut na CPU)
python train.py

# Serwer API + frontend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Otwórz w przeglądarce: http://localhost:8000

## GitHub Pages (wersja statyczna)

Projekt można wystawić na GitHub Pages. W repo jest workflow `Deploy to GitHub Pages`,
który publikuje katalog `frontend/` i kopiuje dane JSON z `backend/data/` do `frontend/data/`.

Kroki:

1. Wypchnij repo na GitHub (gałąź `main`).
2. W ustawieniach repo włącz Pages: **Settings -> Pages -> Source: GitHub Actions**.
3. Po zakończeniu workflow strona będzie dostępna pod adresem:
   `https://<twoj-login>.github.io/<nazwa-repo>/`.

Uwagi:

- Wersja Pages nie uruchamia backendu FastAPI.
- Flagi są pobierane z zewnętrznego CDN (`flagcdn.com`).
- Widok "Rekonstrukcja krok po kroku" wymaga endpointu backendowego i w wersji Pages jest niedostępny.

## Struktura

- `backend/train.py` — pipeline danych i trening
- `backend/app.py` — API FastAPI
- `backend/model/` — wagi autoenkodera
- `backend/data/` — flagi, `metadata.json`, embeddingi
- `frontend/` — HTML/CSS/JS (polski UI)

## API

- `GET /api/flags` — lista flag z klastrami i embeddingami 2D
- `GET /api/metadata` — pełne metadane (klastry, architektura, rekonstrukcje)
- `GET /api/flag/{code}` — obraz flagi
- `GET /api/export/clusters.csv` — eksport klastrów
