import "./env";

console.log("🔥🔥 DEBUG: API Server is attempting to start...");

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agents";
import voiceRoutes from "./routes/voice";
import billingRoutes from "./routes/billing";
import dashboardRoutes from "./routes/dashboard";
import monitoringRoutes from "./routes/monitoring";
import { initDb } from "./db";

const start = async () => {
  try {
    const app = express();
    const httpServer = createServer(app);

    app.use(helmet());
    app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL }));
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/agents", agentRoutes);
    app.use("/api/voice", voiceRoutes);
    app.use("/api/billing", billingRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/monitoring", monitoringRoutes);

    const DEFAULT_PORT = Number(process.env.PORT || 4000);

    httpServer.listen(DEFAULT_PORT, "0.0.0.0", () => {
      console.log(
        `🚀 Sonic Serve AI API listening on http://0.0.0.0:${DEFAULT_PORT}`,
      );
      initDb().catch((err) => console.error("⚠️ DB Init Error:", err.message));
    });

    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        process.exit(1);
      }
    });
  } catch (err: any) {
    console.error("💥 FATAL STARTUP ERROR:", err.message);
    process.exit(1);
  }
};

start();
