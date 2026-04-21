import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";

const router = Router();
router.use(requireAuth);

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const userId = (req as any).userId;

  const interval = setInterval(async () => {
    try {
      const { rows } = await db.query(
        `SELECT vs.*, a.name as agent_name FROM voice_sessions vs
         JOIN agents a ON vs.agent_id = a.id
         WHERE a.user_id = $1 ORDER BY vs.started_at DESC LIMIT 5`,
        [userId],
      );
      res.write(`data: ${JSON.stringify(rows)}\n\n`);
    } catch (err) {
      // Log error but keep stream open
    }
  }, 5000);

  req.on("close", () => clearInterval(interval));
});

export default router;
