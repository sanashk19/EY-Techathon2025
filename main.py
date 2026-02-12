import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from backend.agents.master_agent import run_analysis_from_request
from backend.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
)

app = FastAPI(title="RepurposeQuest AI")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest) -> AnalysisResponse:
    try:
        payload = run_analysis_from_request(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    if hasattr(AnalysisResponse, "model_validate"):
        return AnalysisResponse.model_validate(payload)
    return AnalysisResponse.parse_obj(payload)
