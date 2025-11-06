import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDowntimeEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start a new downtime event
  app.post("/api/downtime/start", async (req, res) => {
    try {
      const data = insertDowntimeEventSchema.parse(req.body);
      const event = await storage.createDowntimeEvent(data);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // End an active downtime event
  app.post("/api/downtime/:id/end", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.endDowntimeEvent(id);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get the currently active downtime event
  app.get("/api/downtime/active", async (req, res) => {
    try {
      const event = await storage.getActiveDowntimeEvent();
      res.json(event || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all downtime events
  app.get("/api/downtime/events", async (req, res) => {
    try {
      const events = await storage.getAllDowntimeEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get downtime statistics
  app.get("/api/downtime/statistics", async (req, res) => {
    try {
      const stats = await storage.getDowntimeStatistics();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get downtime grouped by reason
  app.get("/api/downtime/by-reason", async (req, res) => {
    try {
      const data = await storage.getDowntimeByReason();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
