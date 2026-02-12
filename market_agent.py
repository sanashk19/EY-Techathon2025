from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional


def _safe_load_iqvia_mock() -> Optional[Dict[str, Any]]:
    mock_path = Path(__file__).resolve().parents[1] / "mock_data" / "iqvia.json"
    try:
        with mock_path.open("r", encoding="utf-8") as f:
            return json.load(f) if mock_path.stat().st_size > 0 else None
    except FileNotFoundError:
        return None


def run_market_agent(drug: str, disease: str) -> Dict[str, Any]:
    """Mock market intelligence agent (IQVIA-style synthetic logic).

    No external calls; uses optional local mock file (backend/mock_data/iqvia.json) if present.

    Returns keys: score, explanation, evidence, metrics.
    """

    drug_l = drug.lower().strip()
    disease_l = disease.lower().strip()

    # Base synthetic signals (deterministic, explainable):
    # - Availability: assume common small-molecule generics are more available.
    # - Commercial viability: boosted if disease is common / large market.
    # - Off-label trend: boosted if drug class is known for repurposing (simulated by suffix heuristics).
    availability = 0.8 if len(drug_l) <= 10 else 0.6
    commercial_viability = 0.75 if any(k in disease_l for k in ["diabetes", "cancer", "asthma", "hypertension"]) else 0.55

    # Simple class heuristic based on name endings.
    if drug_l.endswith("in") or drug_l.endswith("statin"):
        off_label_trend = 0.7
    elif drug_l.endswith("mab"):
        off_label_trend = 0.5
    else:
        off_label_trend = 0.6

    mock = _safe_load_iqvia_mock()
    if isinstance(mock, dict):
        # If the user later adds structured mock data, we let it override some signals.
        # Expected (optional) keys: availability, commercial_viability, off_label_trend
        availability = float(mock.get("availability", availability))
        commercial_viability = float(mock.get("commercial_viability", commercial_viability))
        off_label_trend = float(mock.get("off_label_trend", off_label_trend))

    # Scoring logic:
    # - Availability matters for practical repurposing.
    # - Commercial viability affects likelihood of adoption.
    # - Off-label trend is a proxy for physician willingness / precedent.
    score = round(0.4 * availability + 0.4 * commercial_viability + 0.2 * off_label_trend, 3)

    explanation = (
        "Market signals are synthetic (mocked). "
        f"Availability={availability}, CommercialViability={commercial_viability}, OffLabelTrend={off_label_trend}."
    )

    evidence = [
        {
            "source_type": "Market (Synthetic)",
            "source_id": "IQVIA-MOCK:001",
            "content": "Synthetic market snapshot based on mocked heuristics (availability, demand proxies, off-label precedent).",
            "url": None,
        }
    ]

    metrics = {
        "availability": availability,
        "commercial_viability": commercial_viability,
        "off_label_trend": off_label_trend,
        "drug": drug,
        "disease": disease,
    }

    return {
        "score": score,
        "explanation": explanation,
        "evidence": evidence,
        "metrics": metrics,
    }
