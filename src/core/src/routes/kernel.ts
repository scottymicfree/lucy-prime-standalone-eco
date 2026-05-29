// @ts-nocheck
import express, { Request, Response } from "express";
import { emitEvent } from "../../control/emitEvent";
import { dataBus } from "../../control/eventBus";
import { listDir, createFile, openPath, renamePath, deletePath } from "../../control/sandboxFs";
import { logAudit } from "../../control/auditChain";

const router = express.Router();

import { executeEarthIngestion } from "../../control/earthIngestors";

// POST /api/kernel/earth/ingest
router.post("/earth/ingest", async (req: Request, res: Response) => {
    try {
        const { connectorId } = req.body;
        if (!connectorId) return res.status(400).json({ error: "Missing connectorId" });
        const result = await executeEarthIngestion(connectorId);
        res.json({ success: true, result });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/kernel/drift
router.post("/drift", async (req: Request, res: Response) => {
  try {
    const { seismic } = req.body;
    
    // Inject the Python sensor reading directly into the EMMA spine
    emitEvent("EARTH.INTEL", { 
      drift: seismic, 
      source: "Python Ingestor",
      timestamp: Date.now()
    });

    res.json({ success: true, message: "Drift payload ingested into E.M.M.A. EventBus" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/kernel/event
router.post("/event", async (req: Request, res: Response) => {
  try {
    const { channel, payload } = req.body;
    
    // Map Frontend mock IPC payload deeply via native Node dataBus
    if (channel && payload) {
      dataBus.emit(channel, { payload, timestamp: Date.now(), type: channel });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Sandbox Endpoints
router.post('/sandbox/listdir', async (req: Request, res: Response) => {
    try {
        const { path = '' } = req.body;
        const items = await listDir(path);
        res.json({ success: true, items });
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

router.post('/sandbox/mkdir', async (req: Request, res: Response) => {
    try {
        const { path = '' } = req.body;
        // Mock a directory creation by touching a .keep file inside it
        await createFile(`${path}\\.keep`, '');
        try { logAudit({ type: "SANDBOX_MKDIR", path, source: "UI_Or_Emma" }); } catch(e){}
        res.json({ success: true });
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

router.post('/sandbox/upload', async (req: Request, res: Response) => {
    try {
        const { path = '', content = '' } = req.body;
        // Basic decode if it's base64 data URL representation
        let fileContent = content;
        if (typeof content === 'string' && content.startsWith('data:')) {
            fileContent = 'Binary/Base64 content placeholder';
        }
        await createFile(path, fileContent);
        try { logAudit({ type: "SANDBOX_UPLOAD", path, size: fileContent.length }); } catch(e){}
        res.json({ success: true, path });
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

router.post('/sandbox/open', async (req: Request, res: Response) => {
    try {
        const { path = '' } = req.body;
        const target = await openPath(path);
        try { logAudit({ type: "SANDBOX_HUMAN_OVERRIDE", path, target }); } catch(e){}
        res.json({ success: true, message: `Opened ${target} in explorer.` });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/sandbox/rename', async (req: Request, res: Response) => {
    try {
        const { oldPath, newPath } = req.body;
        if (!oldPath || !newPath) {
            return res.status(400).json({ success: false, error: "Missing oldPath or newPath" });
        }
        await renamePath(oldPath, newPath);
        try { logAudit({ type: "SANDBOX_RENAME", oldPath, newPath, source: "UI_Or_Emma" }); } catch(e){}
        res.json({ success: true });
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

router.post('/sandbox/delete', async (req: Request, res: Response) => {
    try {
        const { path } = req.body;
        if (!path) {
            return res.status(400).json({ success: false, error: "Missing path" });
        }
        await deletePath(path);
        try { logAudit({ type: "SANDBOX_DELETE", path, source: "UI_Or_Emma" }); } catch(e){}
        res.json({ success: true });
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

import { getCurrentRuntimeState, mountRuntime, rollbackRuntime } from "../../runtimeMount/runtimeMountService";
import "../services/pulseBridge";
import { BubbleBathProtocol } from "../../identity/BubbleBathProtocol";

// Bubble Bath Endpoint
router.post('/bubblebath/cleanse', async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.body;
        if (!workspaceId) return res.status(400).json({ error: "Missing workspaceId" });
        const result = await BubbleBathProtocol.executeCleansing(workspaceId);
        if (result) {
            res.json({ success: true, message: "Bubble Bath cleansing completed." });
        } else {
            res.status(403).json({ success: false, error: "Bubble Bath cleansing denied or failed." });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Runtime Mount Endpoints
router.get('/runtime/status', (req: Request, res: Response) => {
    res.json({ success: true, state: getCurrentRuntimeState() });
});

router.post('/runtime/mount', async (req: Request, res: Response) => {
    try {
        const { versionId } = req.body;
        const result = await mountRuntime(versionId);
        res.json(result);
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

router.post('/runtime/rollback', async (req: Request, res: Response) => {
    try {
        const { versionId } = req.body;
        const result = await rollbackRuntime(versionId);
        res.json(result);
    } catch (err: any) {
        res.status(403).json({ success: false, error: err.message });
    }
});

// POST /api/kernel/pulse/inject
router.post('/pulse/inject', (req: Request, res: Response) => {
    try {
        const { origin = 'unknown', rawPayload = {}, intensity = Math.random() } = req.body;
        dataBus.emit("SYSTEM.RAW_PULSE.RECEIVED", {
            payload: {
                pulseId: `PLS-${Date.now()}`,
                origin,
                rawPayload,
                timestamp: Date.now(),
                intensity
            }
        });
        res.json({ success: true, message: "Pulse successfully injected into the governance bridge." });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
