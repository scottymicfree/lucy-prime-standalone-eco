// @ts-nocheck
import { dataBus } from '../../control/eventBus';
import { logAudit } from '../../control/auditChain';
import { IPulseSignal, IEmmaAuditRecord } from '../shared/meshTypes';
import crypto from 'crypto';

export class PulseBridge {
    /**
     * The Pulse-to-Emma interface.
     * Takes raw inbound pulses (which could be chaotic or malformed) and maps them into rigid EMMA Governance structs.
     */
    public static async ingestPulse(signal: IPulseSignal) {
        console.log(`[PULSE BRIDGE] Intercepting raw signal: ${signal.pulseId} from origin: ${signal.origin}`);

        // Translation & preliminary risk assessment (Translating Pulse format -> Emma schema)
        let riskScore = "LOW";
        if (signal.intensity > 0.8) riskScore = "HIGH";
        else if (signal.intensity > 0.4) riskScore = "MEDIUM";

        const structuredAction = {
            reqId: crypto.randomUUID(),
            action: "EVALUATE_PULSE_SIGNAL",
            sourceSignal: signal,
            detectedRisk: riskScore,
            timestamp: Date.now()
        };

        // Hand over the translated payload to Emma for Final Governance Evaluation
        dataBus.emit("EMMA.GOVERNANCE.EVALUATE", structuredAction);
    }

    public static bindListeners() {
        // Listen for raw pulses originating from the network layer / external agents
        dataBus.on("SYSTEM.RAW_PULSE.RECEIVED", async (event: any) => {
            const payload = event.payload as IPulseSignal;
            await this.ingestPulse(payload);
        });

        // Listen to Emma's audit resolution to push to local DeltaVault implementation
        dataBus.on("EMMA.GOVERNANCE.RESOLUTION", (event: any) => {
            const record: IEmmaAuditRecord = event.payload;
            
            // Write permanently to Audit Chain
            logAudit({
                type: "PULSE_BRIDGE_RESOLUTION",
                pulseRef: record.pulseRef,
                decision: record.decision,
                reasoning: record.reasoning
            });
            
            console.log(`[🦋 EMMA OVERSEER] Decision on Pulse ${record.pulseRef}: [${record.decision}] - ${record.reasoning}`);
        });
    }
}

// Initialize listeners when this module is injected
PulseBridge.bindListeners();
export default PulseBridge;
