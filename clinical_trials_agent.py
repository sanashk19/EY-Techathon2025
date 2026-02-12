from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List


def run_clinical_trials_agent(drug: str, disease: str) -> Dict[str, Any]:
    """Mock ClinicalTrials.gov agent.

    Uses local JSON data (backend/mock_data/trials.json) and simulated heuristics.

    Returns a dict with keys:
    - score: float (0.0 to 1.0)
    - explanation: str
    - evidence: list[dict]
    - metrics: dict
    """

    mock_path = Path(__file__).resolve().parents[1] / "mock_data" / "trials.json"
    trials: List[Dict[str, Any]] = []

    try:
        with mock_path.open("r", encoding="utf-8") as f:
            trials = json.load(f)
    except FileNotFoundError:
        trials = []

    # Disease match confidence: simple keyword match in trial content.
    disease_lower = disease.lower().strip()
    matching_trials = [t for t in trials if disease_lower and disease_lower in str(t.get("content", "")).lower()]

    # Latest phase estimation: parse "Phase X" from trial text.
    phases: List[int] = []
    for t in trials:
        content = str(t.get("content", ""))
        m = re.search(r"phase\s*(\d)", content, flags=re.IGNORECASE)
        if m:
            phases.append(int(m.group(1)))

    latest_phase = max(phases) if phases else 0

    # Scoring heuristics (explainable + deterministic):
    # - More trials increases confidence up to a cap.
    # - Higher phase implies stronger evidence.
    # - If trials mention the disease explicitly, boost the score.
    trial_count = len(trials)
    trial_count_score = min(trial_count / 5.0, 1.0)  # cap after 5 trials
    phase_score = min(latest_phase / 3.0, 1.0)  # phase 3 => 1.0
    disease_match_confidence = 0.9 if matching_trials else (0.4 if trial_count else 0.1)

    score = round(0.45 * trial_count_score + 0.35 * phase_score + 0.20 * disease_match_confidence, 3)

    explanation = (
        f"Found {trial_count} relevant trial record(s). "
        f"Latest detected phase: {latest_phase or 'unknown'}. "
        f"Disease match confidence: {disease_match_confidence}."
    )

    # Evidence: keep a small, frontend-friendly snippet per trial.
    evidence = []
    for t in trials[:3]:
        evidence.append(
            {
                "source_type": t.get("source_type", "ClinicalTrials.gov"),
                "source_id": t.get("source_id", ""),
                "content": str(t.get("content", ""))[:240],
                "url": t.get("url"),
            }
        )

    metrics = {
        "trial_count": trial_count,
        "latest_phase": latest_phase,
        "disease_match_confidence": disease_match_confidence,
        "matched_trials": len(matching_trials),
        "drug": drug,
        "disease": disease,
    }

    return {
        "score": score,
        "explanation": explanation,
        "evidence": evidence,
        "metrics": metrics,
    }
