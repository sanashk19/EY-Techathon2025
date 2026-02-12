
from __future__ import annotations

import datetime as _dt
import re
from typing import Any, Dict, List, Tuple


_MOCK_PATENTS: List[Dict[str, Any]] = [
    {
        "patent_id": "US-2024-0112233-A1",
        "title": "Alpha-1 adrenergic antagonists for neurodegenerative disorders",
        "abstract": "Disclosed are methods of treating motor neuron disease and related neurodegenerative disorders using alpha-1 adrenergic antagonists.",
        "assignee": "MockBio Therapeutics",
        "filed_date": "2024-03-11",
        "tags": ["neurodegeneration", "motor neuron", "alpha-1"],
    },
    {
        "patent_id": "WO-2023-099991-A2",
        "title": "Compositions and methods for metabolic pathway modulation",
        "abstract": "Pharmaceutical compositions modulating glycolysis to improve cellular stress resistance.",
        "assignee": "Mock University",
        "filed_date": "2023-06-02",
        "tags": ["glycolysis", "metabolism"],
    },
    {
        "patent_id": "US-2019-0042001-A1",
        "title": "Adrenergic blockers for cardiovascular conditions",
        "abstract": "Therapeutic uses of adrenergic blockers for hypertension and related cardiovascular diseases.",
        "assignee": "Legacy Pharma",
        "filed_date": "2018-08-19",
        "tags": ["hypertension", "cardiovascular"],
    },
]


def _parse_date(s: str) -> _dt.date:
    y, m, d = (int(p) for p in s.split("-"))
    return _dt.date(y, m, d)


def _keyword_overlap(text: str, keywords: List[str]) -> float:
    text_l = (text or "").lower()
    hits = 0
    for k in keywords:
        if k and k.lower() in text_l:
            hits += 1
    denom = max(len([k for k in keywords if k]), 1)
    return hits / denom


def run_patent_agent(drug: str, disease: str) -> Dict[str, Any]:
    """PatentAgent (mock)

    Scans a small in-memory mocked patent set.

    Scoring is explainable:
    - novelty_score: newer filings score higher
    - overlap_score: keyword overlap with (drug + disease tokens)
    - final score = weighted combination
    """

    disease_tokens = [t for t in re.split(r"\W+", (disease or "").lower()) if t]
    keywords = [(drug or "").lower(), (disease or "").lower(), *disease_tokens]

    today = _dt.date.today()
    scored: List[Tuple[float, Dict[str, Any], float, float]] = []

    for p in _MOCK_PATENTS:
        filed = _parse_date(p["filed_date"])
        age_days = (today - filed).days

        # Novelty: within ~2 years => close to 1.0, older => decays toward 0.
        novelty_score = max(0.0, min(1.0, 1.0 - (age_days / (365.0 * 6.0))))

        blob = " ".join(
            [
                str(p.get("title", "")),
                str(p.get("abstract", "")),
                " ".join(p.get("tags", []) or []),
            ]
        )
        overlap_score = _keyword_overlap(blob, keywords)

        # Inline scoring logic:
        # - overlap is a proxy for disease relevance
        # - novelty is a proxy for freedom-to-operate / recent activity
        score = 0.55 * overlap_score + 0.45 * novelty_score

        scored.append((score, p, novelty_score, overlap_score))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:3]

    aggregate_score = round(sum(s for s, _, __, ___ in top) / len(top), 3) if top else 0.0
    explanation = (
        "Patent signal is mocked from (1) recency-based novelty and (2) keyword overlap with the drug/disease. "
        "Higher score suggests newer IP activity that mentions related indications/mechanisms."
    )

    evidence = []
    for _, p, novelty_score, overlap_score in top:
        evidence.append(
            {
                "source_type": "Patent (Mock)",
                "source_id": p.get("patent_id", ""),
                "content": f"{p.get('title','')}. Overlap={round(overlap_score,3)}, Novelty={round(novelty_score,3)}.",
                "url": None,
            }
        )

    metrics = {
        "patents_considered": len(_MOCK_PATENTS),
        "top_k": len(top),
        "drug": drug,
        "disease": disease,
    }

    return {
        "score": aggregate_score,
        "explanation": explanation,
        "evidence": evidence,
        "metrics": metrics,
    }

