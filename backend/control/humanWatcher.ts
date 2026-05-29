import { dataBus, EVENT_CATEGORIES } from "./eventBus.js";
import { logAudit } from "./auditChain.js";
import crypto from "crypto";

// Listen to ALL raw human inputs from Electron IPC
dataBus.on(EVENT_CATEGORIES.HUMAN, (event: any) => {
  const { action, source, details } = event.payload;

  // ONLY watch & log — NO reasoningNode, NO proposal, NO governance
  const observation = {
    id: crypto.randomUUID(),
    type: "HUMAN_OBSERVED",
    source, // e.g. "WINDOWS_KEY" or "UE5_BUILD_BUTTON"
    action,
    details,
    timestamp: Date.now(),
    note: "Human action — outside E.M.M.A. control by design"
  };

  logAudit(observation); // DeltaVault sees it

  dataBus.emit("SYSTEM.SPATIALFACE.SURFACED", { // Spatial Face shows it live
    title: "Human Action Observed",
    message: `${source}: ${action}`,
    style: "human-neutral" // green or neutral glow — no proposal
  });
  
  // That's it. No routeProposal. No drift check.
});

console.log("Human Watcher initialized. Protecting boundary.");
