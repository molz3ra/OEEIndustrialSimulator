import { Router } from "express";
import { insertProductionSchema } from "@shared/schema";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

export function createProductionRouter(): Router {
  const router = Router();

  router.use(requireAuth);

  // POST /api/production
  router.post(
    "/",
    validateBody(insertProductionSchema),
    async (req, res, next) => {
      try {
        const userId = req.session.userId!;
        const payload = {
          ...req.body,
          userId,
        };
        const record = await storage.createProductionRecord(payload);
        res.status(201).json(record);
      } catch (err: any) {
        if (err.message && err.message.includes("não encontrada")) {
          return res.status(404).json({ error: err.message });
        }
        next(err);
      }
    }
  );

  // GET /api/production
  router.get("/", async (req, res, next) => {
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

      const records = await storage.getProductionRecords({
        machineId,
        page,
        limit,
      });
      res.json(records);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
