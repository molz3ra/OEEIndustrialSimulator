import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Express } from "express";

export function setupSecurity(app: Express) {
  // Helmet with customized CSP for Vite dev / production scripts
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vite inline dev scripts & styles
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Rate limiter for general API routes (150 requests per minute)
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Muitas requisições. Aguarde um momento e tente novamente." },
  });
  app.use("/api/", apiLimiter);

  // Stricter rate limit for authentication (20 attempts per 15 minutes)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
  });
  app.use("/api/auth/login", authLimiter);
}
