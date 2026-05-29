// Shared Types for Hyper Swarm Mesh interoperability
// Ensures Lucy Core, Edge Nodes, and sub-frameworks share exact schemas

export interface ISwarmManifest {
    meshId: string;
    version: string;
    nodes: string[];
    strictGovernance: boolean;
    allowedSchemas: string[];
}

export interface IPulseSignal {
    pulseId: string;
    origin: string;
    rawPayload: Record<string, any>;
    timestamp: number;
    intensity: number; // 0.0 to 1.0 float representing anomalous weight
}

export interface IEmmaAuditRecord {
    auditId: string;
    pulseRef: string;
    decision: "APPROVE" | "REJECT" | "QUARANTINE" | "DRIFT_BLOCKED";
    reasoning: string;
    timestamp: number;
}
