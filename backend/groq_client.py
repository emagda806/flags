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
  language: str = "pl",
) -> str | None:
  _load_env()
  api_key = os.getenv("GROQ_API_KEY", "").strip()
  base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip().strip('"')
  model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip().strip('"')
  if not api_key:
    return None

  lang = (language or "pl").lower()
  samples = ", ".join(sample_countries[:12])
  if lang == "en":
    prompt = f"""Analyze cluster #{cluster_id + 1} ({member_count} flags).
Color / composition heuristic: {heuristic}.
Representative countries in this cluster (you may mention up to 2-3 naturally): {samples}.

Write ONE concise paragraph in ENGLISH (2-3 sentences) describing the shared visual grammar of these flags.
Requirements:
- Start from structure (bands, fields, crosses, emblem geometry, balance)
- Use concrete color shades (e.g., crimson, navy, emerald, saffron)
- Mention symbolism geometry only if dominant
- Avoid generic filler words like "nice", "interesting", "characteristic"
- End with one sentence about the overall mood or regional association"""
    system = (
      "You are a specialist in flag iconography and visual semiotics. "
      "You write short, precise descriptions for an interactive exhibition. "
      "Style: concrete, vivid, no academic jargon. "
      "Always write plain continuous prose in English."
    )
  else:
    prompt = f"""Przeanalizuj grupę #{cluster_id + 1} ({member_count} flag).
Cechy kolorystyczne: {heuristic}.
Reprezentatywne kraje w klastrze (możesz naturalnie wspomnieć 2-3): {samples}.

Napisz PO POLSKU JEDEN akapit (2-3 zdania) opisujący, co wizualnie łączy te flagi.
Wymagania:
- Zacznij od najbardziej charakterystycznej cechy strukturalnej (układ pasów / pól / kształt symbolu)
- Podaj konkretne kolory z odcieniem (nie "czerwony" lecz "karminowy" / "ceglany" / "jaskrawy")
- Wspomnij o geometrii herbów lub symboli, jeśli są dominujące
- Unikaj słów: "prosty", "charakterystyczny", "typowy", "wyróżniający się"
- Zakończ zdaniem o nastroju lub geograficznym skojarzeniu, które wyłania się z całości"""
    system = (
      "Jesteś specjalistą od ikonografii i semiotyki flag. "
      "Piszesz krótkie, precyzyjne opisy dla interaktywnej wystawy. "
      "Twój styl: konkretny, zmysłowy, bez żargonu akademickiego. "
      "Zawsze piszesz ciągłym tekstem po polsku."
    )

  try:
    r = requests.post(
      f"{base_url}/chat/completions",
      headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
      json={
        "model": model,
        "messages": [
          {
            "role": "system",
            "content": system,
          },
          {"role": "user", "content": prompt},
        ],
        "temperature": 0.55,
        "max_tokens": 220,
      },
      timeout=30,
    )
    r.raise_for_status()
    msg = r.json()["choices"][0]["message"]
    text = (msg.get("content") or "").strip()
    if not text:
      text = (msg.get("reasoning") or "").strip()
    return text if text else None
  except Exception as exc:
    print(f"  GROQ ({lang}, klaster {cluster_id}): {exc}")
    return None


def enrich_clusters(clusters: list[dict], code_to_country: dict[str, str]) -> list[dict]:
  for cl in clusters:
    names = []
    for c in cl.get("sample_codes", []):
      code = str(c).upper()
      country = code_to_country.get(str(c).lower(), code)
      names.append(f"{country} ({code})")

    if not cl.get("ai_description"):
      desc_pl = describe_cluster(
        cl["id"],
        cl["count"],
        names,
        cl.get("traits", {}).get("description", ""),
        language="pl",
      )
      if desc_pl:
        cl["ai_description"] = desc_pl
        print(f"  Opis AI PL — klaster {cl['id'] + 1}")

    if not cl.get("ai_description_en"):
      desc_en = describe_cluster(
        cl["id"],
        cl["count"],
        names,
        cl.get("traits", {}).get("description", ""),
        language="en",
      )
      if desc_en:
        cl["ai_description_en"] = desc_en
        print(f"  Opis AI EN — klaster {cl['id'] + 1}")
  return clusters
