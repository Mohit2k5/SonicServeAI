/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load workspace root .env file so Next.js and Auth.js can access it
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
