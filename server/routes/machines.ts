import { Router } from "express";
import { insertMachineSchema } from "@shared/schema";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireRole } from "../middleware/auth";
import { storage } from "../storage";

export function createMachinesRouter(): Router {
  const router = Router();

  // All machine routes require authentication
  router.use(requireAuth);

  // GET /api/machines
  router.get("/", async (_req, res, next) => {
    try {
      const all = await storage.getAllMachines();
      res.json(all);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/machines/:id
  router.get("/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
      }
      const machine = await storage.getMachine(id);
      if (!machine) {
        return res.status(404).json({ error: "Máquina não encontrada" });
      }
      res.json(machine);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/machines (admin only)
  router.post(
    "/",
    requireRole("admin"),
    validateBody(insertMachineSchema),
    async (req, res, next) => {
      try {
        const created = await storage.createMachine(req.body);
        res.status(201).json(created);
      } catch (err: any) {
        if (err.message && err.message.includes("já existe")) {
          return res.status(409).json({ error: err.message });
        }
        next(err);
      }
    }
  );

  // PATCH /api/machines/:id (admin & manager)
  router.patch(
    "/:id",
    requireRole("admin", "manager"),
    async (req, res, next) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return res.status(400).json({ error: "ID de máquina inválido" });
        }
        const updated = await storage.updateMachine(id, req.body);
        res.json(updated);
      } catch (err: any) {
        if (err.message && err.message.includes("não encontrada")) {
          return res.status(404).json({ error: err.message });
        }
        next(err);
      }
    }
  );

  return router;
}
