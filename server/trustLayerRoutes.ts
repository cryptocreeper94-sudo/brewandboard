import type { Express, Request, Response } from "express";
import {
  connectAll,
  getConnectionStatus,
  registerWithOrbitEcosystem,
  enableSSOLogin,
  enableChatIntegration,
  sendHeartbeat,
  syncBookkeepingData,
  syncHRData,
} from "./trustLayerService";
import logger from "./logger";

function getBaseUrl(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "brewandboard.coffee";
  return `${proto}://${host}`;
}

export function registerTrustLayerRoutes(app: Express) {
  app.get("/api/trust-layer/status", async (_req: Request, res: Response) => {
    try {
      const status = getConnectionStatus();
      res.json({ success: true, ...status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/connect", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const result = await connectAll(baseUrl);
      res.json({ success: true, ...result });
    } catch (error: any) {
      logger.error("[TrustLayer] Connect all failed", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/register", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const result = await registerWithOrbitEcosystem(baseUrl);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/sso/enable", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const result = await enableSSOLogin(baseUrl);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/chat/enable", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const result = await enableChatIntegration(baseUrl);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/heartbeat", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const alive = await sendHeartbeat(baseUrl);
      res.json({ success: alive, timestamp: new Date().toISOString() });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/sync/bookkeeping", async (req: Request, res: Response) => {
    try {
      const { type, records } = req.body;
      if (!type || !records) {
        return res.status(400).json({ success: false, error: "type and records required" });
      }
      const result = await syncBookkeepingData({ type, records });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/sync/hr", async (req: Request, res: Response) => {
    try {
      const { type, records } = req.body;
      if (!type || !records) {
        return res.status(400).json({ success: false, error: "type and records required" });
      }
      const result = await syncHRData({ type, records });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trust-layer/callback", async (req: Request, res: Response) => {
    logger.info("[TrustLayer] Received ecosystem callback", req.body);
    res.json({ received: true, timestamp: new Date().toISOString() });
  });

  app.post("/api/trust-layer/webhook", async (req: Request, res: Response) => {
    logger.info("[TrustLayer] Received webhook", req.body);
    res.json({ received: true, timestamp: new Date().toISOString() });
  });

  app.get("/api/trust-layer/sso/callback", async (req: Request, res: Response) => {
    logger.info("[TrustLayer] SSO callback", req.query);
    res.json({ received: true, sso: "callback", query: req.query });
  });

  app.get("/api/trust-layer/sso/logout", async (req: Request, res: Response) => {
    logger.info("[TrustLayer] SSO logout callback");
    res.json({ received: true, sso: "logout" });
  });

  app.post("/api/trust-layer/chat/webhook", async (req: Request, res: Response) => {
    logger.info("[TrustLayer] Chat webhook", req.body);
    res.json({ received: true, chat: "webhook" });
  });

  logger.info("[TrustLayer] Trust Layer routes registered — Orbit Staffing ecosystem integration ready");
}
