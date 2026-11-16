import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export const isDbConfigured = Boolean(process.env.DATABASE_URL);

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (isDbConfigured) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle({ client: pool, schema });
}

export { pool };
export const db = dbInstance as ReturnType<typeof drizzle>;
