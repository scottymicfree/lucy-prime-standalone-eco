import asyncio
from core.config import load_config
from NodeMesh.event_bus import EventBus
from orchestrator import Orchestrator
from MobileAPI.app import app
import uvicorn

async def bootstrap():
    print("Bootstrapping EnhancedLucyMind...")
    config = load_config()
    bus = EventBus()
    orchestrator = Orchestrator(bus)
    print("All subsystems initialized.")

if __name__ == "__main__":
    asyncio.run(bootstrap())
    uvicorn.run(app, host="0.0.0.0", port=8000)\n