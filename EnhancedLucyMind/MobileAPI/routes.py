from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# We will inject the orchestrator directly from main payload but let's wire it directly for abstraction
from NodeMesh.event_bus import EventBus
from orchestrator import Orchestrator

# Ensure we're using a singleton Orchestrator for route logic
bus = EventBus()
global_orchestrator = Orchestrator(bus)

router = APIRouter()

class InputPayload(BaseModel):
    text: str
    source: str = "mobile"

@router.post("/input")
async def process_input(payload: InputPayload):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    try:
        result = await global_orchestrator.handle_request(text)
        return {"status": "success", "response": result["response"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/response")
async def get_response():
    return {"response": "System nominal."}

@router.get("/state")
async def get_state():
    return {"lucy_state": "idle", "active_agents": [], "pending_tasks": 0}

@router.get("/health")
async def get_health():
    return {"status": "ok"}\n