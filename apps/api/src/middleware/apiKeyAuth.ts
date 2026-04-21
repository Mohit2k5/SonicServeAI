import { Request, Response, NextFunction } from "express";
import { db } from "../db";

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = req.headers["x-api-key"] as string;
  if (!key) return res.status(401).json({ error: "API key required" });

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE api_key = $1", [
      key,
    ]);
    if (!rows[0]) return res.status(401).json({ error: "Invalid API key" });

    (req as any).userId = rows[0].id;
    (req as any).user = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
}
