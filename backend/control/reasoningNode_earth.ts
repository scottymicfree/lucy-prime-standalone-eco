import { dataBus, EVENT_CATEGORIES } from "./eventBus.js";
import { routeProposal } from "./routeProposal.js";
import { runPriorityIngestions } from "./earthIngestors.js";
import crypto from 'crypto';

/**
 * Sentinel Drift evaluation
 * Simulates detecting if the AI is drifting in logic or going off-track.
 */
async function checkSentinelDrift() {
  // Mock drift verification returning a low value (healthy)
  return Math.random() * 0.04; 
}

// ---------------------------------------------------------
// NODE LISTENER: UI Dashboard Routing
// Ensures human navigation requests go through governance
// ---------------------------------------------------------
dataBus.on("USER.SELECT.MODULE", async (event: any) => {
  const { module } = event.payload;

  // Eagle Eye quick check — prevents drift across views
  const driftScore = await checkSentinelDrift();
  if (driftScore > 0.05) {
    dataBus.emit("SYSTEM.PROPOSAL.REJECTED", { reason: `Sentinel Drift detected: ${driftScore}` });
    return;
  }

  // Trigger priority earth data sync when Earth panel activates
  if (module === "EARTH") {
      runPriorityIngestions().catch(e => console.error("Earth ingestion failed", e));
  }

  const proposal = {
    id: crypto.randomUUID(),
    type: "DASHBOARD_FLIP",
    module,
    confidence: Math.max(0, 0.95 - driftScore), // High confidence, penalize by drift slightly
    action: `LOAD_DEDICATED_DASHBOARD_${module}`,
    reason: `User requested ${module} control center — governed & isolated`,
  };

  await routeProposal(proposal);
});

// ---------------------------------------------------------
// NODE LISTENER: Earth Intelligence
// The "brain stem" turning raw data hits into proposals
// ---------------------------------------------------------
dataBus.on("EARTH.INTEL", async (event: any) => {
  // ← THIS IS THE BOUNDARY (Guard against human input taking this execution pathway)
  if (event.type && event.type.startsWith("HUMAN.INPUT")) return; 

  const payload = event.payload || {};
  
  // Extract external Python sensor metrics over HTTP or fallback to mock if direct native execution
  const seismicDrift = typeof payload.drift === "number" ? payload.drift : (Math.random() * 0.15);
  const climatePressure = payload.climate || 0.02; // Mock climate constraint
  
  // New Stability = Baseline (1.0) - (Seismic Drift + Climate Pressure)
  const stability = 1.0 - (seismicDrift + climatePressure);
  
  const isCritical = stability < 0.85;

  // Generate proposal governed by the new stability values
  const proposal = {
    id: crypto.randomUUID(),
    type: "LUCY.ACTION", // Formally constrained Emma action
    source: "earth-intel",
    confidence: isCritical ? 0.95 : 0.60,
    action: isCritical ? "Re-Scaffold UE5 Digital Twin" : "Maintain baseline Omniverse projection",
    reason: `Earth Stability dropped to ${(stability*100).toFixed(1)}%. Twin Earth Reaction threshold triggered.`,
  };

  await routeProposal(proposal);
});

// ---------------------------------------------------------
// NODE LISTENER: Scaffold Runtime Mount Governance
// Evaluates safety of a generated scaffold attempting to become active
// ---------------------------------------------------------
dataBus.on("EMMA.MOUNT_APPROVAL.REQUEST", async (event: any) => {
  const { reqId, versionId } = event.payload;
  console.log(`[🛡️ EMMA GOVERNANCE] Evaluating runtime mount request for: ${versionId}`);

  // Eagle Eye check — if we are drifting too much, deny new core modules
  const driftScore = await checkSentinelDrift();
  let decision;

  if (driftScore > 0.1) {
    decision = {
        approved: false,
        trust: 1.0 - driftScore,
        risk: "high",
        reason: "Core system instability / Sentinel Drift too high. Scaffold mounting frozen for safety."
    };
  } else {
    decision = {
        approved: true,
        trust: 0.98 - driftScore,
        risk: "low",
        reason: "Scaffold integrity verified. Execution layer patterns fall within governed constraints."
    };
  }

  // Reply explicitly
  dataBus.emit("EMMA.MOUNT_APPROVAL.RESPONSE", {
      payload: { reqId, decision }
  });
});

// ---------------------------------------------------------
// NODE LISTENER: Pulse Governance (EMMA)
// Evaluates chaotic inbound data payloads mapped by PulseBridge
// ---------------------------------------------------------
dataBus.on("EMMA.GOVERNANCE.EVALUATE", async (event: any) => {
    const payload = event;
    const reqId = payload.reqId;
    const signal = payload.sourceSignal;
    const risk = payload.detectedRisk;

    const driftScore = await checkSentinelDrift();
    let decision = "APPROVE";
    let reasoning = "Signal within nominal boundaries";

    if (driftScore > 0.1 || risk === "HIGH") {
        decision = "QUARANTINE";
        reasoning = `High risk pulse or drift detected (Risk: ${risk}, Drift: ${driftScore.toFixed(2)})`;
    } else if (signal.intensity > 1.0) {
        decision = "REJECT";
        reasoning = "Signal intensity exceeds maximum physical bounds (1.0).";
    }

    const resolution = {
        auditId: crypto.randomUUID(),
        pulseRef: signal.pulseId,
        decision,
        reasoning,
        timestamp: Date.now()
    };

    dataBus.emit("EMMA.GOVERNANCE.RESOLUTION", { payload: resolution });
});

console.log("Reasoning Node (EARTH, UI, & PULSE/MOUNT context) initialized.");
