import express, { Request, Response } from "express";
import { DeepResearchKernel, DeepResearchRequest } from "../../deepResearch/DeepResearchKernel";

const router = express.Router();

// POST /api/research/execute
router.post("/execute", async (req: Request, res: Response) => {
    try {
        const payload: DeepResearchRequest = req.body;
        if (!payload.query || !payload.reportTopic) {
            return res.status(400).json({ error: "Missing query or reportTopic" });
        }
        
        // Execute Deep Research pipeline async
        const result = await DeepResearchKernel.executeResearch(payload);
        res.json({ success: true, result });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
