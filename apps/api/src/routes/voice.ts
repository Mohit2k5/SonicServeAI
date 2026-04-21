import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

/**
 * POST /api/voice/webhook
 * Vapi calls this when the assistant invokes a tool (function call).
 * We handle two tools:
 *   - lookup_order    → find order by order number or customer name/phone
 *   - list_orders     → list all orders for a customer
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body as VapiWebhookPayload;

  // Vapi sends different message types; we only care about tool-calls
  if (body.message?.type !== 'tool-calls') {
    return res.json({ results: [] });
  }

  const results: ToolResult[] = [];

  for (const toolCall of body.message.toolCallList ?? []) {
    const { name, parameters } = toolCall.function;

    try {
      if (name === 'lookup_order') {
        const result = await handleLookupOrder(parameters);
        results.push({ toolCallId: toolCall.id, result });
      } else if (name === 'list_orders') {
        const result = await handleListOrders(parameters);
        results.push({ toolCallId: toolCall.id, result });
      } else {
        results.push({
          toolCallId: toolCall.id,
          result: `Unknown tool: ${name}`,
        });
      }
    } catch (err: any) {
      console.error(`[Voice Webhook] Tool "${name}" failed:`, err.message);
      results.push({
        toolCallId: toolCall.id,
        result: 'Sorry, I had trouble retrieving that information. Please try again.',
      });
    }
  }

  return res.json({ results });
});

// ─── Tool handlers ─────────────────────────────────────────────────────────────

async function handleLookupOrder(params: Record<string, string>): Promise<string> {
  const { order_number, customer_name, customer_phone } = params;

  let query = '';
  const values: string[] = [];

  if (order_number) {
    const norm = order_number.replace(/\s+/g, '').toUpperCase();
    query = `
      SELECT o.order_number, o.platform, o.customer_name, o.product_name, o.quantity,
             o.total_amount, o.status, o.tracking_number, o.carrier,
             o.estimated_delivery, o.order_date
      FROM demo_orders o
      WHERE UPPER(REPLACE(o.order_number, ' ', '')) = $1
      LIMIT 1
    `;
    values.push(norm);
  } else if (customer_phone) {
    query = `
      SELECT o.order_number, o.platform, o.customer_name, o.product_name, o.quantity,
             o.total_amount, o.status, o.tracking_number, o.carrier,
             o.estimated_delivery, o.order_date
      FROM demo_orders o
      WHERE o.customer_phone ILIKE $1
      ORDER BY o.order_date DESC
      LIMIT 1
    `;
    values.push(`%${customer_phone.replace(/\D/g, '').slice(-10)}%`);
  } else if (customer_name) {
    query = `
      SELECT o.order_number, o.platform, o.customer_name, o.product_name, o.quantity,
             o.total_amount, o.status, o.tracking_number, o.carrier,
             o.estimated_delivery, o.order_date
      FROM demo_orders o
      WHERE o.customer_name ILIKE $1
      ORDER BY o.order_date DESC
      LIMIT 1
    `;
    values.push(`%${customer_name}%`);
  } else {
    return 'Please provide an order number, customer name, or phone number to look up an order.';
  }

  const { rows } = await db.query(query, values);

  if (!rows.length) {
    return `I couldn't find any order matching the provided information. Please double-check the order number or name and try again.`;
  }

  const o = rows[0];
  return formatOrder(o);
}

async function handleListOrders(params: Record<string, string>): Promise<string> {
  const { customer_name, customer_phone } = params;

  if (!customer_name && !customer_phone) {
    return 'Please tell me your name or phone number so I can pull up your orders.';
  }

  let query = '';
  const values: string[] = [];

  if (customer_phone) {
    query = `
      SELECT o.order_number, o.platform, o.product_name, o.status, o.order_date
      FROM demo_orders o
      WHERE o.customer_phone ILIKE $1
      ORDER BY o.order_date DESC
      LIMIT 5
    `;
    values.push(`%${customer_phone.replace(/\D/g, '').slice(-10)}%`);
  } else {
    query = `
      SELECT o.order_number, o.platform, o.product_name, o.status, o.order_date
      FROM demo_orders o
      WHERE o.customer_name ILIKE $1
      ORDER BY o.order_date DESC
      LIMIT 5
    `;
    values.push(`%${customer_name}%`);
  }

  const { rows } = await db.query(query, values);

  if (!rows.length) {
    return `I couldn't find any orders for that customer. Please confirm your name or phone number.`;
  }

  const lines = rows.map(
    (o) =>
      `Order ${o.order_number} from ${o.platform}: ${o.product_name} — Status: ${formatStatus(o.status)} (placed ${formatDate(o.order_date)})`
  );

  return `I found ${rows.length} order${rows.length > 1 ? 's' : ''} for you:\n${lines.join('\n')}`;
}

// ─── Formatters ────────────────────────────────────────────────────────────────

function formatOrder(o: any): string {
  const lines: string[] = [
    `Order ${o.order_number} placed on ${o.platform}`,
    `Product: ${o.product_name} (Qty: ${o.quantity})`,
    `Amount: ₹${Number(o.total_amount).toLocaleString('en-IN')}`,
    `Status: ${formatStatus(o.status)}`,
    `Ordered on: ${formatDate(o.order_date)}`,
  ];

  if (o.tracking_number && o.carrier) {
    lines.push(`Tracking: ${o.tracking_number} via ${o.carrier}`);
  }

  if (o.estimated_delivery) {
    const deliveryDate = formatDate(o.estimated_delivery);
    if (o.status === 'delivered') {
      lines.push(`Delivered on: ${deliveryDate}`);
    } else if (o.status !== 'cancelled' && o.status !== 'returned') {
      lines.push(`Estimated delivery: ${deliveryDate}`);
    }
  }

  return lines.join('. ');
}

function formatStatus(s: string): string {
  const map: Record<string, string> = {
    processing: 'Processing — being prepared for shipment',
    shipped: 'Shipped — on its way to you',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return map[s] ?? s;
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Type definitions ─────────────────────────────────────────────────────────

interface ToolCall {
  id: string;
  function: {
    name: string;
    parameters: Record<string, string>;
  };
}

interface VapiWebhookPayload {
  message?: {
    type: string;
    toolCallList?: ToolCall[];
  };
}

interface ToolResult {
  toolCallId: string;
  result: string;
}

export default router;
