from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class StructuredInput(BaseModel):
    text: str
    intent: str
    domain: str
    urgency: str
    metadata: dict

class AgentOutput(BaseModel):
    agent_id: str
    reasoning: str
    draft_output: str
    confidence: float

class FinalResponse(BaseModel):
    response: str
    confidence: float
    source: str

class PulseSignal(BaseModel):
    pulseId: str
    origin: str
    rawPayload: Dict[str, Any]
    timestamp: int
    intensity: float

class EmmaAuditRecord(BaseModel):
    auditId: str
    pulseRef: str
    decision: str
    reasoning: str
    timestamp: int\n