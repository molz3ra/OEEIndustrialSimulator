import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { setupSecurity } from "./middleware/security";
import { createAuthRouter } from "./routes/auth";
import { createMachinesRouter } from "./routes/machines";
import { createDowntimeRouter } from "./routes/downtime";
import { createProductionRouter } from "./routes/production";
import { createOEERouter } from "./routes/oee";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.set("trust proxy", 1);
const MemoryStore = memorystore(session);

// ── Body Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// ── Security Middleware ────────────────────────────────────────────
setupSecurity(app);

// ── Session Management (8 hours = 1 industrial shift) ───────────────
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "industrial-oee-simulator-session-secret-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE === "true",
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      sameSite: "lax",
    },
  })
);

// ── Request Logging ────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// ── Health Check ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ── API Routes ─────────────────────────────────────────────────────
app.use("/api/auth", createAuthRouter());
app.use("/api/machines", createMachinesRouter());
app.use("/api/downtime", createDowntimeRouter());
app.use("/api/production", createProductionRouter());
app.use("/api/oee", createOEERouter());

// ── Error Handler (sem re-throw) ───────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erro interno do servidor";
  console.error(`[SERVER ERROR] ${status}: ${message}`, err.stack);
  res.status(status).json({ error: message });
});

// ── Server Bootstrap & Frontend Serving ────────────────────────────
const server = createServer(app);

(async () => {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(import.meta.dirname, "public");
  const distExists = fs.existsSync(distPath);

  if (isProd || distExists) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Servidor OEE Industrial rodando em http://localhost:${port}`);
  });
})();

// Graceful shutdown
process.on("SIGTERM", () => {
  log("Sinal SIGTERM recebido, encerrando servidor...");
  server.close(() => {
    log("Servidor encerrado com sucesso.");
    process.exit(0);
  });
});

export { app, server };
