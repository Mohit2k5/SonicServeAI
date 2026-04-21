import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";

const router = Router();
router.use(requireAuth);

// GET /api/agents — list user's agents
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM agents WHERE user_id=$1 ORDER BY created_at DESC",
      [(req as any).userId],
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents — create agent
router.post("/", async (req, res) => {
  try {
    const { name, language, system_prompt, voice_id, tts_model, webhook_url } =
      req.body;
    const { rows } = await db.query(
      `INSERT INTO agents (user_id, name, language, system_prompt, voice_id, tts_model, webhook_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        (req as any).userId,
        name,
        language,
        system_prompt,
        voice_id,
        tts_model,
        webhook_url,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/agents/:id — update agent
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      language,
      system_prompt,
      voice_id,
      tts_model,
      webhook_url,
      is_active,
    } = req.body;
    const { rows } = await db.query(
      `UPDATE agents SET name=$1, language=$2, system_prompt=$3, voice_id=$4, tts_model=$5,
       webhook_url=$6, is_active=$7 WHERE id=$8 AND user_id=$9 RETURNING *`,
      [
        name,
        language,
        system_prompt,
        voice_id,
        tts_model,
        webhook_url,
        is_active,
        req.params.id,
        (req as any).userId,
      ],
    );
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/agents/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM agents WHERE id=$1 AND user_id=$2", [
      req.params.id,
      (req as any).userId,
    ]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/all/logs — get logs for all agents
router.get("/all/logs", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT vs.*, a.name as agent_name 
       FROM voice_sessions vs 
       JOIN agents a ON vs.agent_id = a.id 
       WHERE a.user_id = $1 
       ORDER BY vs.started_at DESC LIMIT 100`,
      [(req as any).userId],
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id/logs
router.get("/:id/logs", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM voice_sessions WHERE agent_id=$1 ORDER BY started_at DESC LIMIT 50`,
      [req.params.id],
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
