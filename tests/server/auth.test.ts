import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import memorystore from "memorystore";
import { createAuthRouter } from "../../server/routes/auth";

const MemoryStore = memorystore(session);

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret: "test-secret-key-oee",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );
  app.use("/api/auth", createAuthRouter());
  return app;
}

describe("Autenticação Industrial", () => {
  const app = createTestApp();

  it("deve rejeitar login com credenciais inválidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "operador", password: "senha_errada" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Usuário ou senha inválidos");
  });

  it("deve autenticar operador com sucesso", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "operador", password: "operador123" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("operador");
    expect(res.body.role).toBe("operator");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("deve rejeitar /me sem sessão ativa", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
