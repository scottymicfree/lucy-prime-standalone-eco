import crypto from 'crypto';

interface AuditEntry {
  id: string;
  prevHash: string;
  timestamp: number;
  proposal: any;
  hash: string;
}

// In-memory DeltaVault simulation (would be persisted in Timescale or local DB)
const deltaVaultChain: AuditEntry[] = [];

/**
 * Immutable log of all governed decisions and proposals.
 */
export function logAudit(proposal: any) {
  const prevHash = deltaVaultChain.length > 0 
    ? deltaVaultChain[deltaVaultChain.length - 1].hash 
    : '0000000000000000000000000000000000000000000000000000000000000000';
    
  const timestamp = Date.now();
  const id = crypto.randomUUID();
  const payloadString = JSON.stringify(proposal);

  const hash = crypto.createHash('sha256')
    .update(id + prevHash + timestamp + payloadString)
    .digest('hex');

  const entry: AuditEntry = { id, prevHash, timestamp, proposal, hash };
  deltaVaultChain.push(entry);

  console.log(`[DELTAVAULT] Audit Logged: ${hash.substring(0, 12)}... | Type: ${proposal.type}`);
  return entry;
}

export function getAuditChain() {
  return deltaVaultChain;
}
