import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";

const router = Router();
router.use(requireAuth);

router.get("/stats", async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Total sessions count
    const sessionsRes = await db.query(
      "SELECT COUNT(*) FROM voice_sessions WHERE user_id = $1",
      [userId],
    );

    // Total tokens used
    const tokensRes = await db.query(
      "SELECT SUM(tokens_used) FROM voice_sessions WHERE user_id = $1",
      [userId],
    );

    // Active agents count
    const agentsRes = await db.query(
      "SELECT COUNT(*) FROM agents WHERE user_id = $1 AND is_active = true",
      [userId],
    );

    res.json({
      totalSessions: parseInt(sessionsRes.rows[0].count),
      totalTokens: parseInt(tokensRes.rows[0].sum || "0"),
      activeAgents: parseInt(agentsRes.rows[0].count),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
