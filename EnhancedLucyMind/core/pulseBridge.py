import uuid
import time
from core.models import PulseSignal, EmmaAuditRecord
from core.message_schema import NodeMessage

class PulseBridge:
    """
    Translates incoming signals from the 'Pulse' system into a structured 
    format that Emma can audit and govern.
    """
    def __init__(self, event_bus):
        self.event_bus = event_bus

    async def ingest_pulse(self, signal: PulseSignal):
        print(f"[PULSE BRIDGE] Intercepting raw signal: {signal.pulseId} from origin: {signal.origin}")
        
        # Translation & preliminary risk assessment
        risk_score = "LOW"
        if signal.intensity > 0.8:
            risk_score = "HIGH"
        elif signal.intensity > 0.4:
            risk_score = "MEDIUM"

        structured_action = {
            "reqId": str(uuid.uuid4()),
            "action": "EVALUATE_PULSE_SIGNAL",
            "sourceSignal": signal.model_dump() if hasattr(signal, "model_dump") else signal.dict(),
            "detectedRisk": risk_score,
            "timestamp": int(time.time() * 1000)
        }

        # Format as strict NodeMessage per core/message_schema.py contract
        pulse_message = {
            "id": str(uuid.uuid4()),
            "source": "PulseBridge",
            "target": "EmmaPrime",
            "type": "event",
            "payload": structured_action,
            "confidence": 1.0,
            "trace": ["PulseBridge"],
            "timestamp": int(time.time() * 1000)
        }
        
        # Emit over the shared EventBus
        self.event_bus.emit(pulse_message)
        
        return structured_action
