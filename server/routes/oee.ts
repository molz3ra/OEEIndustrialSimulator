import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

export function createOEERouter(): Router {
  const router = Router();

  router.use(requireAuth);

  // GET /api/oee/summary/:machineId
  router.get("/summary/:machineId", async (req, res, next) => {
    try {
      const machineId = parseInt(req.params.machineId, 10);
      if (isNaN(machineId)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
      }
      const summary = await storage.getMachineOEESummary(machineId);
      res.json(summary);
    } catch (err: any) {
      if (err.message && err.message.includes("não encontrada")) {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  });

  // GET /api/oee/trend/:machineId
  router.get("/trend/:machineId", async (req, res, next) => {
    try {
      const machineId = parseInt(req.params.machineId, 10);
      if (isNaN(machineId)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
      }
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const trend = await storage.getOEETrend(machineId, days);
      res.json(trend);
    } catch (err: any) {
      if (err.message && err.message.includes("não encontrada")) {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  });

  // GET /api/oee/overview
  router.get("/overview", async (_req, res, next) => {
    try {
      const overview = await storage.getGlobalOEEOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
