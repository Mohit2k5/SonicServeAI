import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { generateApiKey } from "../utils/keys";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const apiKey = generateApiKey();
    const { rows } = await db.query(
      `INSERT INTO users (email, name, password_hash, api_key)
       VALUES ($1,$2,$3,$4) RETURNING id, email, name, plan, api_key`,
      [email, name, hash, apiKey],
    );
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({ user: rows[0], token });
  } catch (error: any) {
    const errorMsg = error?.message || String(error) || "Internal Server Error";
    console.error("❌ Registration Error:", errorMsg, error?.stack);
    res.status(500).json({ 
      error: errorMsg,
      details: String(error), 
      stack: error?.stack 
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({
      user: { id: rows[0].id, email, name: rows[0].name, plan: rows[0].plan },
      token,
    });
  } catch (error: any) {
    console.error("❌ Login Error:", error?.message, error?.stack);
    res.status(500).json({ 
      error: error?.message || "Internal Server Error",
      details: String(error), 
      stack: error?.stack 
    });
  }
});

export default router;
