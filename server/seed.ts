import bcrypt from "bcryptjs";
import { db, isDbConfigured } from "./db";
import { users, machines } from "@shared/schema";
import { log } from "./vite";

async function seed() {
  if (!isDbConfigured) {
    log("DATABASE_URL não configurada. O seed já foi carregado em memória.", "seed");
    return;
  }

  log("Iniciando seed no banco de dados Neon...", "seed");
  const salt = bcrypt.genSaltSync(10);

  // 1. Inserir usuários padrão se não existirem
  const adminPass = bcrypt.hashSync("admin123", salt);
  const managerPass = bcrypt.hashSync("gerente123", salt);
  const operatorPass = bcrypt.hashSync("operador123", salt);

  try {
    await db.insert(users).values([
      {
        username: "admin",
        passwordHash: adminPass,
        displayName: "Administrador do Sistema",
        role: "admin",
      },
      {
        username: "gerente",
        passwordHash: managerPass,
        displayName: "Carlos Gerente",
        role: "manager",
      },
      {
        username: "operador",
        passwordHash: operatorPass,
        displayName: "Lucas Operador",
        role: "operator",
      },
    ]).onConflictDoNothing();

    // 2. Inserir máquinas industriais
    await db.insert(machines).values([
      {
        name: "Torno CNC Haas ST-20",
        code: "CNC-01",
        description: "Torno CNC de alta precisão para eixos e peças cilíndricas",
        status: "running",
        idealCycleTimeSec: 45,
        plannedProductionPerShift: 450,
      },
      {
        name: "Centro de Usinagem Romi D800",
        code: "CNC-02",
        description: "Centro de usinagem vertical 3 eixos para moldes e ferramentas",
        status: "stopped",
        idealCycleTimeSec: 60,
        plannedProductionPerShift: 400,
      },
      {
        name: "Prensa Hidráulica 200T",
        code: "PRS-03",
        description: "Prensa de conformação a frio e estampagem",
        status: "running",
        idealCycleTimeSec: 30,
        plannedProductionPerShift: 700,
      },
    ]).onConflictDoNothing();

    log("Seed concluído com sucesso!", "seed");
  } catch (err: any) {
    console.error("Erro ao executar seed:", err);
  }
}

seed().catch(console.error);
