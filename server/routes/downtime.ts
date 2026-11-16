import { Router } from "express";
import { insertDowntimeSchema, endDowntimeSchema } from "@shared/schema";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

export function createDowntimeRouter(): Router {
  const router = Router();

  router.use(requireAuth);

  // POST /api/downtime/start
  router.post(
    "/start",
    validateBody(insertDowntimeSchema),
    async (req, res, next) => {
      try {
        const userId = req.session.userId!;
        const payload = {
          ...req.body,
          userId,
        };
        const event = await storage.createDowntime(payload);
        res.status(201).json(event);
      } catch (err: any) {
        if (
          err.message &&
          err.message.includes("já possui uma parada ativa")
        ) {
          return res.status(409).json({ error: err.message });
        }
        next(err);
      }
    }
  );

  // POST /api/downtime/:id/end
  router.post(
    "/:id/end",
    validateBody(endDowntimeSchema),
    async (req, res, next) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return res.status(400).json({ error: "ID de parada inválido" });
        }
        const event = await storage.endDowntime(id, req.body.notes);
        res.json(event);
      } catch (err: any) {
        if (err.message && err.message.includes("já foi finalizado")) {
          return res.status(409).json({ error: err.message });
        }
        if (err.message && err.message.includes("não encontrado")) {
          return res.status(404).json({ error: err.message });
        }
        next(err);
      }
    }
  );

  // GET /api/downtime/active/:machineId
  router.get("/active/:machineId", async (req, res, next) => {
    try {
      const machineId = parseInt(req.params.machineId, 10);
      if (isNaN(machineId)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
      }
      const active = await storage.getActiveDowntime(machineId);
      res.json(active || null);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/downtime/events
  router.get("/events", async (req, res, next) => {
    try {
      const machineId = req.query.machineId
        ? parseInt(req.query.machineId as string, 10)
        : undefined;
      const page = req.query.page
        ? parseInt(req.query.page as string, 10)
        : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 15;

      const events = await storage.getAllDowntimes({ machineId, page, limit });
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/downtime/statistics
  router.get("/statistics", async (req, res, next) => {
    try {
      const machineId = req.query.machineId
        ? parseInt(req.query.machineId as string, 10)
        : undefined;
      const stats = await storage.getDowntimeStatistics(machineId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/downtime/by-reason
  router.get("/by-reason", async (req, res, next) => {
    try {
      const machineId = req.query.machineId
        ? parseInt(req.query.machineId as string, 10)
        : undefined;
      const data = await storage.getDowntimeByReason(machineId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
