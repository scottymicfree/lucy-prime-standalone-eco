from pydantic import BaseModel

class NodeMessage(BaseModel):
    id: str
    source: str
    target: str
    type: str # request|response|event
    payload: dict
    confidence: float
    trace: list
    timestamp: int\n