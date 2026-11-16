import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import memorystore from "memorystore";
import { createProductionRouter } from "../../server/routes/production";
import { createOEERouter } from "../../server/routes/oee";

const MemoryStore = memorystore(session);

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret: "test-secret-oee",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );

  app.use((req, _res, next) => {
    req.session.userId = 3;
    req.session.role = "operator";
    req.session.username = "operador";
    req.session.displayName = "Lucas Operador";
    next();
  });

  app.use("/api/production", createProductionRouter());
  app.use("/api/oee", createOEERouter());
  return app;
}

describe("Rotas de Produção e OEE", () => {
  const app = createTestApp();

  it("deve criar apontamento de produção calculando OEE automaticamente", async () => {
    const res = await request(app)
      .post("/api/production")
      .send({
        machineId: 1,
        shiftDate: "2026-11-16",
        shift: "morning",
        plannedQuantity: 450,
        producedQuantity: 430,
        goodQuantity: 415,
        defectiveQuantity: 15,
        plannedTimeMinutes: 480,
        actualRunTimeMinutes: 440,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("oee");
    expect(res.body.availability).toBeGreaterThan(0);
    expect(res.body.performance).toBeGreaterThan(0);
    expect(res.body.quality).toBeGreaterThan(0);
    expect(res.body.oee).toBeCloseTo(
      res.body.availability * res.body.performance * res.body.quality,
      3
    );
  });

  it("deve retornar resumo OEE por máquina", async () => {
    const res = await request(app).get("/api/oee/summary/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("machine");
    expect(res.body).toHaveProperty("currentOEE");
    expect(res.body.currentOEE).toHaveProperty("oee");
  });

  it("deve retornar visão geral de todas as máquinas para o dashboard", async () => {
    const res = await request(app).get("/api/oee/overview");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
