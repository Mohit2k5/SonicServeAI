import { Pool } from "pg";
import { createClient } from "redis";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ Database schema file not found at:", schemaPath);
      return;
    }
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split schema into individual commands to avoid atomic failure and for better debugging
    // This is a simple split, assuming no semicolons inside strings
    const commands = schema
      .split(";")
      .map((cmd) => cmd.trim())
      .filter(Boolean);

    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    for (const cmd of commands) {
      try {
        await pool.query(cmd);
      } catch (cmdErr: any) {
        // Ignore "already exists" errors during re-init
        if (!cmdErr.message.includes("already exists")) {
          console.warn(
            `⚠️ Command failed: ${cmd.substring(0, 50)}... | Error: ${cmdErr.message}`,
          );
        }
      }
    }

    console.log("✅ Database schema initialized/verified");
  } catch (err: any) {
    console.error("❌ Database initialization failed:", err.message);
    const maskedUrl = process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":****@");
    console.log(`[DB Debug] Connection URL: ${maskedUrl}`);
  }
}

// Exporting as 'db' so we don't break all the other files
export const db = pool;
export default pool;

export const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", (err) => console.log("Redis Client Error", err));

redis.connect().catch(console.error);
