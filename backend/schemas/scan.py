from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional

class ScanUrlRequest(BaseModel):
    url: str

class ScanMessageRequest(BaseModel):
    content: str

class EvidenceItem(BaseModel):
    feature: str
    value: str
    impact: str
    description: str

class ModelInfo(BaseModel):
    primary: str
    probability: float
    rf_probability: float

class ScanResponse(BaseModel):
    scan_id: str
    input_type: str
    risk_score: int
    risk_level: str
    model: ModelInfo
    evidence: List[EvidenceItem]
    # These will be populated in later phases
    threat_intelligence: Optional[Dict[str, Any]] = None
    live_analysis: Optional[Dict[str, Any]] = None
    vision_analysis: Optional[Dict[str, Any]] = None
    explanation: Optional[Dict[str, Any]] = None
    awareness: Optional[Dict[str, Any]] = None
    similar_scans: Optional[int] = 0
