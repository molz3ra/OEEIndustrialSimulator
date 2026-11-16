import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    displayName: string;
    role: User["role"];
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Sessão expirada ou não autenticado" });
  }
  next();
}

export function requireRole(...allowedRoles: User["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Sessão expirada ou não autenticado" });
    }
    const userRole = req.session.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Acesso não autorizado para o seu perfil" });
    }
    next();
  };
}
