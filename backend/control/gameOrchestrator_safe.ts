import { dataBus, EVENT_CATEGORIES } from "./eventBus";
import crypto from "crypto";
import { logAudit } from "./auditChain"; // Assume we have some audit chain logic

export function createUnitySafePlan(request: string) {
    return {
        steps: [
            { id: 1, desc: "Detect or create Unity project at user-configured path" },
            { id: 2, desc: "Generate or update custom Build Script (C# Editor method using BuildPipeline)" },
            { id: 3, desc: "Propose CLI command: Unity.exe -batchmode -projectPath ... -executeMethod BuildScript.PerformBuild" },
            { id: 4, desc: "Plan Blender → GLTF/FBX import into Unity Assets" },
            { id: 5, desc: "Plan procedural generation (PCG for St. Louis map) or VR setup (XR Interaction Toolkit)" },
            { id: 6, desc: "Preview final build target (Windows, VR, etc.) and asset list" }
        ]
    };
}

dataBus.on(EVENT_CATEGORIES.LUCY, async (event: any) => {
    if (event.type && event.type.startsWith(EVENT_CATEGORIES.HUMAN)) return; 

    // Unity-specific governed plan proposal
    if (event.payload && event.payload.request) {
        const request = event.payload.request.toLowerCase();
        if (!request.includes("unity")) return;

        const plan = createUnitySafePlan(request);
        const proposal = {
            id: crypto.randomUUID(),
            type: "UNITY_BUILD_PROPOSAL", // HUD handles this if we map it, or we use LUCY_BUILD_PROPOSAL to map to chat directly over existing
            request,
            plan,
            message: `✅ Unity Plan for: "${event.payload.request}"\n\n${plan.steps.map((s,i) => `${i+1}. ${s.desc}`).join("\n")}\n\nReply "approve all" or "approve step X". (Proposal only — no execution)`,
            status: "PROPOSAL_ONLY"
        };
        
        // This surfaces the proposal to HUD & Chat
        dataBus.emit("SYSTEM.SPATIALFACE.SURFACED", proposal);
        
        // Audit log
        try {
            logAudit({ type: "UNITY_PROPOSAL", proposalId: proposal.id });
        } catch(e) {
            console.log("[AUDIT] Fallback log:", proposal.id);
        }
    }
});
