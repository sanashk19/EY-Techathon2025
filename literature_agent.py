
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple


def _sentence_summary(text: str, max_len: int = 220) -> str:
    text = (text or "").strip()
    if not text:
        return ""

    # Extractive summary: first sentence (fallback to truncation).
    parts = re.split(r"(?<=[.!?])\s+", text)
    first = parts[0].strip() if parts else text
    if len(first) > max_len:
        return first[: max_len - 3].rstrip() + "..."
    return first


def _keyword_overlap_score(text: str, keywords: List[str]) -> float:
    if not text:
        return 0.0
    text_l = text.lower()
    hits = sum(1 for k in keywords if k and k.lower() in text_l)
    denom = max(len([k for k in keywords if k]), 1)
    return hits / denom


def run_literature_agent(drug: str, disease: str) -> Dict[str, Any]:
    """LiteratureAgent (mock)

    Searches local PubMed-like abstracts from backend/mock_data/pubmed_samples.json.

    Scoring is simulated and explainable:
    - Keyword overlap of (drug, disease, disease tokens) in abstract text
    - Blended with the mock record's confidence_score as a quality prior
    """

    mock_path = Path(__file__).resolve().parents[1] / "mock_data" / "pubmed_samples.json"
    payload: List[Dict[str, Any]] = []

    try:
        with mock_path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
    except FileNotFoundError:
        payload = []

    disease_tokens = [t for t in re.split(r"\W+", (disease or "").lower()) if t]
    keywords = [(drug or "").lower(), (disease or "").lower(), *disease_tokens]

    scored: List[Tuple[float, Dict[str, Any]]] = []
    for entry in payload:
        content = str(entry.get("content", ""))

        # Inline scoring logic:
        # - overlap: whether this abstract appears to mention your drug/disease terms
        # - prior: a mock "study quality" signal provided in the JSON
        overlap = _keyword_overlap_score(content, keywords)
        prior = float(entry.get("confidence_score", 0.5))

        score = 0.6 * overlap + 0.4 * prior
        scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:3]

    aggregate_score = round(sum(s for s, _ in top) / len(top), 3) if top else 0.0

    explanation = (
        "PubMed relevance is mocked using keyword overlap (drug/disease mentions) combined with a "
        "mock confidence prior from the dataset."
    )

    evidence = []
    for _, e in top:
        evidence.append(
            {
                "source_type": e.get("source_type", "PubMed"),
                "source_id": e.get("source_id", ""),
                "content": _sentence_summary(str(e.get("content", ""))),
                "url": e.get("url"),
            }
        )

    metrics = {
        "abstracts_considered": len(payload),
        "top_k": len(top),
        "scoring": {"overlap_weight": 0.6, "prior_weight": 0.4},
        "drug": drug,
        "disease": disease,
    }

    return {
        "score": aggregate_score,
        "explanation": explanation,
        "evidence": evidence,
        "metrics": metrics,
    }

