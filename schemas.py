from pydantic import BaseModel
from typing import Any, Dict, List, Optional

# This model represents a single piece of proof (a paper, a trial, or a patent)
class Evidence(BaseModel):
    source_type: str       # e.g., "PubMed", "ClinicalTrials.gov", "Patent"
    source_id: str         # e.g., "PMID:12345", "NCT04567"
    content: str           # The summary or abstract text
    url: Optional[str] = None
    confidence_score: float # 0.0 to 1.0

# This model represents one drug candidate found by your system
class DrugRepurposingResult(BaseModel):
    drug_name: str
    target_disease: str
    mechanism_of_action: str
    overall_confidence: float
    evidence_list: List[Evidence]

# This is what the Frontend sends to YOU
class AnalysisRequest(BaseModel):
    drug: str
    disease: str

class AgentEvidence(BaseModel):
    source_type: str
    source_id: str
    content: str
    url: Optional[str] = None

class AgentOutput(BaseModel):
    score: float
    explanation: str
    evidence: List[AgentEvidence]
    metrics: Optional[Dict[str, Any]] = None

# --- NEW: Graph Visualization Models ---
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "drug", "disease", "pathway", "gene"

class GraphLink(BaseModel):
    source: str
    target: str
    label: str # e.g., "inhibits", "associated_with"

class GraphData(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

class AgentResults(BaseModel):
    literature: AgentOutput
    clinical_trials: AgentOutput
    patent: AgentOutput
    market: AgentOutput

class AnalysisResponse(BaseModel):
    query_info: AnalysisRequest
    repurposing_score: float
    explainability_summary: str
    agent_results: AgentResults
    knowledge_graph: Optional[GraphData] = None