import { Router } from "express";
import Stripe from "stripe";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import express from "express";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const router = Router();

// POST /api/billing/checkout — create Stripe checkout session
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { plan } = req.body; // 'developer' | 'enterprise'
    const userId = (req as any).userId;
    const {
      rows: [user],
    } = await db.query("SELECT * FROM users WHERE id=$1", [userId]);

    const priceId =
      plan === "enterprise"
        ? process.env.STRIPE_ENTERPRISE_PRICE_ID
        : process.env.STRIPE_DEVELOPER_PRICE_ID;

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    if (!stripe) {
      return res
        .status(503)
        .json({ error: "Stripe is not configured on this server" });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId, plan },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/billing/webhook — Stripe webhook handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"]!;
    let event;

    try {
      if (!stripe) {
        return res.status(503).send("Stripe is not configured");
      }
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const { userId, plan } = session.metadata || {};
      if (userId && plan) {
        await db.query("UPDATE users SET plan=$1 WHERE id=$2", [plan, userId]);
      }
    }

    res.json({ received: true });
  },
);

export default router;
