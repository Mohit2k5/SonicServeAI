import { Request, Response, NextFunction } from "express";
import { redis } from "../db";

export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = (req as any).userId;
  if (!userId) return next();

  const key = `rate:${userId}`;
  const limit = 100; // 100 requests
  const windowSecs = 3600; // per hour

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSecs);
    }

    if (count > limit) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    next();
  } catch (err) {
    next(); // Don't block on redis errors
  }
}
