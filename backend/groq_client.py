"""Opisy klastrów przez GROQ API (opcjonalnie)."""

from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent


def _load_env() -> None:
  try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
  except ImportError:
    pass


def describe_cluster(
  cluster_id: int,
  member_count: int,
  sample_countries: list[str],
  heuristic: str,
) -> str | None:
  _load_env()
  api_key = os.getenv("GROQ_API_KEY", "").strip()
  base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip().strip('"')
  if not api_key:
    return None

  samples = ", ".join(sample_countries[:8])
  prompt = f"""Przeanalizuj grupę #{cluster_id + 1} ({member_count} flag). \
Cechy kolorystyczne: {heuristic}. \
Reprezentatywne kraje (tylko kontekst, nie wymieniaj ich): {samples}.

Napisz PO POLSKU JEDEN akapit (2–3 zdania) opisujący, co wizualnie łączy te flagi. \
Wymagania:
• Zacznij od najbardziej charakterystycznej cechy strukturalnej (układ pasów / pól / kształt symbolu)
• Podaj konkretne kolory z odcieniem (nie "czerwony" lecz "karminowy" / "ceglany" / "jaskrawy")
• Wspomnij o geometrii herbów lub symboli, jeśli są dominujące
• Unikaj słów: "prosty", "charakterystyczny", "typowy", "wyróżniający się"
• Zakończ zdaniem o nastroju lub geograficznym skojarzeniu, które wyłania się z całości"""

  try:
    r = requests.post(
      f"{base_url}/chat/completions",
      headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
      json={
        "model": "openai/gpt-oss-120b",
        "messages": [
          {
            "role": "system",
            "content": (
              "Jesteś specjalistą od ikonografii i semiotyki flag. "
              "Piszesz krótkie, precyzyjne opisy dla interaktywnej wystawy. "
              "Twój styl: konkretny, zmysłowy, bez żargonu akademickiego. "
              "Nigdy nie używasz list. Zawsze piszesz ciągłym tekstem po polsku."
            ),
          },
          {"role": "user", "content": prompt},
        ],
        "temperature": 0.55,
        "max_tokens": 220,
      },
      timeout=30,
    )
    r.raise_for_status()
    text = r.json()["choices"][0]["message"]["content"].strip()
    return text if text else None
  except Exception as exc:
    print(f"  GROQ (klaster {cluster_id}): {exc}")
    return None


def enrich_clusters(clusters: list[dict], code_to_country: dict[str, str]) -> list[dict]:
  for cl in clusters:
    if cl.get("ai_description"):
      continue
    names = [code_to_country.get(c.lower(), c) for c in cl.get("sample_codes", [])]
    desc = describe_cluster(
      cl["id"],
      cl["count"],
      names,
      cl.get("traits", {}).get("description", ""),
    )
    if desc:
      cl["ai_description"] = desc
      print(f"  Opis AI — klaster {cl['id'] + 1}")
  return clusters
