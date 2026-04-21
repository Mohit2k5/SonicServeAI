import dotenv from "dotenv";
import path from "path";

// CommonJS compatible path resolution
const rootEnvPath = path.resolve(process.cwd(), "../../.env");

dotenv.config({ path: rootEnvPath });

console.log("✅ Environment variables loaded");
console.log("DB URL defined:", !!process.env.DATABASE_URL);
console.log("AUTH SECRET defined:", !!process.env.AUTH_SECRET);
