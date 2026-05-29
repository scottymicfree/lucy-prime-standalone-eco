import { dataBus } from './eventBus.js';
import { logAudit } from './auditChain.js';

export async function routeProposal(proposal: any) {
  console.log(`[EMMA GOVERNANCE] Evaluating proposal: ${proposal.type} | Priority: ${proposal.confidence}`);

  // Base governance threshold check
  if (proposal.confidence < 0.5) {
    console.warn(`[EMMA REJECTED] Confidence too low: ${proposal.confidence}`);
    dataBus.emit("SYSTEM.PROPOSAL.REJECTED", { reason: "Confidence beneath minimum threshold", proposal });
    return false;
  }

  // Successful evaluation
  console.log(`[EMMA APPROVED] Proposal mapped to system action.`);
  
  // Hash-chain audit mapping
  logAudit(proposal);

  // Surface safely depending on application architecture constraints
  switch (proposal.type) {
    case "DASHBOARD_FLIP":
      // Instructs UI to switch views completely
      dataBus.emit("SYSTEM.DASHBOARD.FLIP", proposal);
      break;
    case "EARTH_INTERVENTION":
      // Tells the Spatial Face there is a proposal pending execution
      dataBus.emit("SYSTEM.PROPOSAL.SURFACED", proposal);
      break;
    default:
      // Send for dry-run simulation
      dataBus.emit("SYSTEM.SIMULATION.APPROVED", proposal);
  }

  return true;
}
