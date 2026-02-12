from __future__ import annotations

from typing import Any, Dict

from backend.agents.clinical_trials_agent import run_clinical_trials_agent
from backend.agents.literature_agent import run_literature_agent
from backend.agents.market_agent import run_market_agent
from backend.agents.patent_agent import run_patent_agent
from backend.models.schemas import AnalysisRequest


DEFAULT_AGENT_WEIGHTS: Dict[str, float] = {
    "literature": 0.35,
    "clinical_trials": 0.30,
    "patent": 0.15,
    "market": 0.20,
}


def _weighted_average(scores: Dict[str, float], weights: Dict[str, float]) -> float:
    total_w = 0.0
    acc = 0.0
    for k, w in weights.items():
        if k not in scores:
            continue
        total_w += w
        acc += w * float(scores[k])
    return acc / total_w if total_w else 0.0


def run_analysis(drug: str, disease: str, *, weights: Dict[str, float] | None = None) -> Dict[str, Any]:
    """Run the full RepurposeQuest analysis with modular, explainable (mock) agents.

    This is deliberately pure-Python (stdlib only) so you can later swap mock logic
    for real API calls / LLM tools.

    Returns a frontend-friendly dictionary matching the AnalysisResponse schema.
    """

    w = weights or DEFAULT_AGENT_WEIGHTS

    literature = run_literature_agent(drug, disease)
    clinical_trials = run_clinical_trials_agent(drug, disease)
    patent = run_patent_agent(drug, disease)
    market = run_market_agent(drug, disease)

    scores = {
        "literature": float(literature.get("score", 0.0)),
        "clinical_trials": float(clinical_trials.get("score", 0.0)),
        "patent": float(patent.get("score", 0.0)),
        "market": float(market.get("score", 0.0)),
    }
    repurposing_score = round(_weighted_average(scores, w), 3)

    explainability_summary = (
        f"Weighted repurposing_score={repurposing_score} using "
        f"literature={scores['literature']}, clinical_trials={scores['clinical_trials']}, "
        f"patent={scores['patent']}, market={scores['market']}."
    )

    return {
        "query_info": {"drug": drug, "disease": disease},
        "repurposing_score": repurposing_score,
        "explainability_summary": explainability_summary,
        "agent_results": {
            "literature": literature,
            "clinical_trials": clinical_trials,
            "patent": patent,
            "market": market,
        },
        "knowledge_graph": None,
    }


def run_analysis_from_request(request: AnalysisRequest) -> Dict[str, Any]:
    return run_analysis(request.drug, request.disease)