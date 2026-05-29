# WHAT THIS DOES:
Provides the source note and documentation for the VR/Quest Bridge Additive Layer.

# WHY THIS EXISTS:
To explain the limitations, boundaries, and intent of the VR access layer within the Lucy-core-AI architecture. VR should be an interface for checking, requesting, inspecting, and proposing, but NEVER directly executing critical system actions without passing through the ActionEngine.

# HOW THIS WORKS:
The VR bridge operates as a spatial client. It connects into the EventBus or API to read dashboard states, view logs, inspect artifacts, and generate action proposals. Action proposals are submitted to the ActionEngine for a final risk and execution check.

# HOW TO CHANGE IT:
Modify this file to add new VR headset targets or WebXR specifications. Do not change the fundamental security rule regarding the ActionEngine.

# DEBUG EXAMPLE:
If a VR user attempts to restart a server and the server restarts directly, this is a security failure. Inspect the VRBridge to ensure it uses `ActionEngine.proposeAndExecute({ action: 'RESTART_SERVER' })` rather than `Server.restart()`.
