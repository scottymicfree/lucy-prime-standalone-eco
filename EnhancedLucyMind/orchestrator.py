from NodeMesh.event_bus import EventBus
from LucyPrime.synthesis_engine import synthesize
from Memory.episodic import EpisodicMemory

class Orchestrator:
    def __init__(self, bus: EventBus):
        self.bus = bus
        self.memory = EpisodicMemory()
        print("Orchestrator online.")

    async def handle_request(self, raw_text: str):
        print(f"Handling request: {raw_text}")
        
        # 1. Log episodic memory
        self.memory.log_trace(session_id="LOCAL", trace_type="INPUT", payload={"text": raw_text})
        
        # 2. Synthesize using our local inference stub
        result = synthesize(merged_reasoning={"context":"simulated"}, structured_input=raw_text)
        
        # 3. Log response memory
        self.memory.log_trace(session_id="LOCAL", trace_type="OUTPUT", payload=result)

        return result\n