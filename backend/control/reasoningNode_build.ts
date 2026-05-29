import { dataBus, EVENT_CATEGORIES } from "./eventBus.js";
import crypto from "crypto";

function getBuildCommand(payload: any) {
    if (process.platform !== 'win32') {
        // Fallback for sandboxed linux
        return `echo "Simulating Local Windows Execution (UE5 lane) via Linux Container..." && sleep 2`;
    }
    if (payload.lane === "UE5") {
        return `"${payload.ue5Path || "C:\\Program Files\\Epic Games\\UE_5.4\\Engine\\Binaries\\Win64\\UnrealBuildTool.exe"}" -project="${payload.projectPath}" -build -platform=Win64 -configuration=Development`;
    }
    if (payload.lane === "UNITY") {
        return `"Unity.exe" -batchmode -projectPath "${payload.projectPath}" -executeMethod BuildScript.PerformBuild -quit`;
    }
    return "";
}

dataBus.on(EVENT_CATEGORIES.LUCY, async (event: any) => {
    // boundary stays
    if (event.type && event.type.startsWith(EVENT_CATEGORIES.HUMAN)) return; 
    
    // We listen to governed intent that comes through the pipe
    if (event.action && event.action.includes("UE5 Digital Twin")) {
        const lane = event.payload?.lane || "UE5";
        
        const proposal = {
            id: crypto.randomUUID(),
            type: "LUCY_BUILD_PROPOSAL",
            lane: lane, 
            action: "EXECUTE_BUILD",
            command: getBuildCommand(event.payload || {}), 
            message: `Lucy proposes: Build in ${lane} lane with stability mesh. Reply "approve" in debug chat to trigger live execution.`,
            userConfig: {} // Lucy will ask user for paths first time
        };

        // Emit specifically so the new Chat UI hooks this
        dataBus.emit("SYSTEM.SPATIALFACE.SURFACED", proposal); 
    }
});
