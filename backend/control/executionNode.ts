import { dataBus } from "./eventBus.js";
import { logAudit } from "./auditChain.js";
import { exec } from "child_process";
import crypto from "crypto";

dataBus.on("LUCY.ACTION.APPROVED", async (event: any) => {
    // From chat approval payload
    const proposal = event.payload || {}; 
    
    // Human approved → now execute (still auditable)
    const governed = { ...proposal, status: "EXECUTING", executedAt: Date.now() };
    
    dataBus.emit("SYSTEM.PROPOSAL.GOVERNED", governed);

    try {
        const buildCmd = proposal.command || 'echo "Simulated build..." && sleep 2'; 
        const cwd = proposal.projectPath || process.cwd();

        exec(buildCmd, { cwd }, (error, stdout, stderr) => {
            const result = {
                id: crypto.randomUUID(),
                type: "BUILD_EXECUTED",
                success: !error,
                output: stdout || stderr,
                lane: proposal.lane || "UE5"
            };
            
            logAudit(result);
            
            // Push HUD popup result
            dataBus.emit("SYSTEM.SPATIALFACE.SURFACED", {
                title: `Build Complete — ${result.lane}`,
                message: result.success ? "✅ Executed successfully" : "❌ Failed — see logs",
                style: "lucy"
            });

            // Push result back to debug chat directly
            dataBus.emit("SYSTEM.SPATIALFACE.SURFACED", {
                type: "LUCY_BUILD_PROPOSAL",
                message: result.success ? "Build finished output sent to DeltaVault. What is our next objective?" : "Build failed — check DeltaVault"
            });
        });
    } catch (e: any) {
        logAudit({ type: "EXECUTION_ERROR", error: e.message });
    }
});
