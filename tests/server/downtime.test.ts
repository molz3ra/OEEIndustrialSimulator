import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import memorystore from "memorystore";
import { createDowntimeRouter } from "../../server/routes/downtime";

const MemoryStore = memorystore(session);

function createTestApp(userId: number = 3) {
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

  // Mock authenticated session
  app.use((req, _res, next) => {
    req.session.userId = userId;
    req.session.role = "operator";
    req.session.username = "operador";
    req.session.displayName = "Lucas Operador";
    next();
  });

  app.use("/api/downtime", createDowntimeRouter());
  return app;
}

describe("Rotas de Parada de Linha (Downtime)", () => {
  const app = createTestApp(3);

  it("deve retornar estatísticas de parada", async () => {
    const res = await request(app).get("/api/downtime/statistics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalDurationMinutes");
    expect(res.body).toHaveProperty("eventCount");
    expect(res.body).toHaveProperty("activeCount");
  });

  it("deve retornar distribuição de perdas por motivo (Pareto)", async () => {
    const res = await request(app).get("/api/downtime/by-reason");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("deve retornar eventos paginados", async () => {
    const res = await request(app).get("/api/downtime/events?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page", 1);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("deve registrar nova parada e rejeitar parada simultânea na mesma máquina", async () => {
    // Machine 3 is currently running in seed data
    const startRes = await request(app)
      .post("/api/downtime/start")
      .send({
        machineId: 3,
        reason: "tool_changeover",
        notes: "Troca de ferramenta de corte",
      });

    expect(startRes.status).toBe(201);
    expect(startRes.body.machineId).toBe(3);
    expect(startRes.body.endTime).toBeNull();

    // Attempt second downtime on machine 3 while active
    const duplicateRes = await request(app)
      .post("/api/downtime/start")
      .send({
        machineId: 3,
        reason: "mechanical_failure",
        notes: "Tentativa concorrente",
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error).toContain("já possui uma parada ativa");

    // End the downtime
    const endRes = await request(app)
      .post(`/api/downtime/${startRes.body.id}/end`)
      .send({ notes: "Concluído com sucesso" });

    expect(endRes.status).toBe(200);
    expect(endRes.body.endTime).not.toBeNull();
    expect(endRes.body.durationMinutes).toBeGreaterThanOrEqual(1);
  });
});
