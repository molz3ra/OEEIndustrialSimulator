import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema } from "@shared/schema";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

export function createAuthRouter(): Router {
  const router = Router();

  // POST /api/auth/login
  router.post("/login", validateBody(loginSchema), async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !user.active) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.displayName = user.displayName;
      req.session.role = user.role;

      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/auth/logout
  router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Falha ao encerrar sessão" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Desconectado com sucesso" });
    });
  });

  // GET /api/auth/me
  router.get("/me", (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    return res.json({
      id: req.session.userId,
      username: req.session.username,
      displayName: req.session.displayName,
      role: req.session.role,
    });
  });

  return router;
}
