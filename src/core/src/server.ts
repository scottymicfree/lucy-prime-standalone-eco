// @ts-nocheck
import express, { Request, Response } from "express";
import cors from "cors";
// @ts-ignore
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

import buildersRouter from "./routes/builders";
import earthRouter from "./routes/earth";
import filesRouter from "./routes/files";
import buildsRouter from "./routes/builds";
import kernelRouter from "./routes/kernel";
import deepResearchRouter from "./routes/deepResearch";
import { dataBus } from "../control/eventBus";

// IMPORTANT: Initialize reasoning nodes alongside server mapping
import "../control/reasoningNode_earth";
import "../control/reasoningNode_build";
import "../control/executionNode";
import "../control/humanWatcher";
import "../control/gameOrchestrator_safe";
import "../deepResearch/DeepResearchKernel";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb" }));

  // Routes
  // Note: Handlers are mocked in routers for visual demonstration purposes
  app.use("/api/builders", buildersRouter);
  app.use("/api/earth", earthRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/builds", buildsRouter);
  app.use("/api/kernel", kernelRouter);
  app.use("/api/research", deepResearchRouter);

  // Proxy for EnhancedLucyMind local python instance
  app.use("/api/mind", async (req: Request, res: Response) => {
      try {
          const fetchRes = await fetch(`http://127.0.0.1:8000${req.path}`, {
              method: req.method,
              headers: { 'Content-Type': 'application/json' },
              body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
          });
          const data = await fetchRes.json();
          res.json(data);
      } catch (e) {
          console.error("Local Mind Offline:", e);
          res.status(503).json({ error: "Local Python cognitive mesh offline or unavailable." });
      }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const path = await import("path");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // WebSocket handler for real-time build updates & EventBus bridge
  wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify({ channel: "SYSTEM.LOG", payload: { message: "Connected to Lucy Kernel" } }));

    const busListener = (payload: any) => {
      // Stringify and pipe spatial surface events to active React frontends
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ channel: "SYSTEM.SPATIALFACE.SURFACED", payload }));
      }
    };

    dataBus.on("SYSTEM.SPATIALFACE.SURFACED", busListener);

    ws.on('close', () => {
      dataBus.off("SYSTEM.SPATIALFACE.SURFACED", busListener);
      console.log("Client disconnected");
    });
  });

  // Attach WebSocket to app for use in routes
  (app as any).wss = wss;

  server.listen(3000, "0.0.0.0", () => {
    console.log("Lucy backend running on http://localhost:3000");
  });
}

startServer();
