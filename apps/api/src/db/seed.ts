/**
 * seed.ts — Seeds demo customers and orders into Postgres.
 * Run with: npx ts-node src/db/seed.ts
 */
import '../env';
import { db } from '.';

const customers = [
  { name: 'Rahul Sharma',  email: 'rahul@demo.com',  phone: '+91-9876543210' },
  { name: 'Priya Mehta',   email: 'priya@demo.com',  phone: '+91-9876543211' },
  { name: 'Amit Verma',    email: 'amit@demo.com',   phone: '+91-9876543212' },
  { name: 'Sneha Kapoor',  email: 'sneha@demo.com',  phone: '+91-9876543213' },
  { name: 'Vikram Singh',  email: 'vikram@demo.com', phone: '+91-9876543214' },
];

// Platform prefix → full platform name
const PLATFORMS: Record<string, string> = {
  AMZ:  'Amazon',
  FLK:  'Flipkart',
  MYN:  'Myntra',
  AJO:  'Ajio',
  TCL:  'Tata CLiQ',
  NYK:  'Nykaa',
  MNT:  'Meesho',
};

const orders = [
  // Rahul
  {
    customer_email: 'rahul@demo.com',
    order_number:   'AMZ-4821',
    platform:       'AMZ',
    product_name:   'Sony WH-1000XM5 Headphones',
    quantity:        1,
    total_amount:    29990,
    status:         'shipped',
    carrier:        'BlueDart',
    tracking_number:'BD9876543',
    order_date:     '2026-04-19',
    estimated_delivery: '2026-04-23',
  },
  {
    customer_email: 'rahul@demo.com',
    order_number:   'FLK-1093',
    platform:       'FLK',
    product_name:   'boAt Rockerz 450 Pro Headphones',
    quantity:        1,
    total_amount:    1499,
    status:         'delivered',
    carrier:        'Ekart',
    tracking_number:'EK7890123',
    order_date:     '2026-04-14',
    estimated_delivery: '2026-04-18',
  },
  // Priya
  {
    customer_email: 'priya@demo.com',
    order_number:   'MYN-2274',
    platform:       'MYN',
    product_name:   'Zara Floral Midi Dress',
    quantity:        1,
    total_amount:    3599,
    status:         'processing',
    carrier:        null,
    tracking_number: null,
    order_date:     '2026-04-21',
    estimated_delivery: '2026-04-26',
  },
  {
    customer_email: 'priya@demo.com',
    order_number:   'NYK-0347',
    platform:       'NYK',
    product_name:   'Lakme Absolute Foundation SPF 35',
    quantity:        2,
    total_amount:    1198,
    status:         'shipped',
    carrier:        'Delhivery',
    tracking_number:'DL1234567',
    order_date:     '2026-04-20',
    estimated_delivery: '2026-04-24',
  },
  // Amit
  {
    customer_email: 'amit@demo.com',
    order_number:   'TCL-5519',
    platform:       'TCL',
    product_name:   'Samsung 65" QLED 4K TV',
    quantity:        1,
    total_amount:    89999,
    status:         'delivered',
    carrier:        'Tata CLiQ Logistics',
    tracking_number:'TC9988776',
    order_date:     '2026-04-10',
    estimated_delivery: '2026-04-15',
  },
  {
    customer_email: 'amit@demo.com',
    order_number:   'AMZ-7733',
    platform:       'AMZ',
    product_name:   'Apple iPhone 15 Pro (256GB)',
    quantity:        1,
    total_amount:   134900,
    status:         'returned',
    carrier:        'BlueDart',
    tracking_number:'BD4561234',
    order_date:     '2026-04-05',
    estimated_delivery: '2026-04-09',
  },
  // Sneha
  {
    customer_email: 'sneha@demo.com',
    order_number:   'AJO-6601',
    platform:       'AJO',
    product_name:   'Puma Carina Streetwear Sneakers',
    quantity:        1,
    total_amount:    4999,
    status:         'cancelled',
    carrier:        null,
    tracking_number: null,
    order_date:     '2026-04-16',
    estimated_delivery: '2026-04-21',
  },
  {
    customer_email: 'sneha@demo.com',
    order_number:   'MNT-3382',
    platform:       'MNT',
    product_name:   'Kurti Set Embroidered Cotton (L)',
    quantity:        2,
    total_amount:    1598,
    status:         'processing',
    carrier:        null,
    tracking_number: null,
    order_date:     '2026-04-22',
    estimated_delivery: '2026-04-28',
  },
  // Vikram
  {
    customer_email: 'vikram@demo.com',
    order_number:   'FLK-8845',
    platform:       'FLK',
    product_name:   'Dyson V15 Detect Vacuum Cleaner',
    quantity:        1,
    total_amount:    52900,
    status:         'shipped',
    carrier:        'Ekart',
    tracking_number:'EK5554433',
    order_date:     '2026-04-18',
    estimated_delivery: '2026-04-23',
  },
  {
    customer_email: 'vikram@demo.com',
    order_number:   'AMZ-2256',
    platform:       'AMZ',
    product_name:   'Logitech MX Master 3 Wireless Mouse',
    quantity:        1,
    total_amount:    8995,
    status:         'delivered',
    carrier:        'BlueDart',
    tracking_number:'BD7779999',
    order_date:     '2026-04-13',
    estimated_delivery: '2026-04-17',
  },
];

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  console.log('🌱 Seeding demo data...\n');

  // Create tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS demo_customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS demo_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT UNIQUE NOT NULL,
      platform TEXT NOT NULL DEFAULT 'Unknown',
      customer_id UUID REFERENCES demo_customers(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      product_name TEXT NOT NULL,
      quantity INT DEFAULT 1,
      total_amount NUMERIC(10, 2) NOT NULL,
      status TEXT DEFAULT 'processing',
      tracking_number TEXT,
      carrier TEXT,
      estimated_delivery DATE,
      order_date TIMESTAMPTZ DEFAULT NOW(),
      last_updated TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add platform column if upgrading from old schema
  await db.query(`
    ALTER TABLE demo_orders ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'Unknown'
  `).catch(() => { /* ignore if already exists */ });

  // Clear old seed data so we can re-seed cleanly
  await db.query(`DELETE FROM demo_orders`);
  await db.query(`DELETE FROM demo_customers`);
  console.log('🗑️  Cleared old demo data\n');

  // Insert customers
  const customerMap: Record<string, { id: string; name: string; phone: string }> = {};
  for (const c of customers) {
    const { rows } = await db.query(
      `INSERT INTO demo_customers (name, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
       RETURNING id, name, phone`,
      [c.name, c.email, c.phone]
    );
    customerMap[c.email] = rows[0];
    console.log(`  👤  Customer: ${rows[0].name}`);
  }

  console.log('');

  // Insert orders
  for (const o of orders) {
    const customer = customerMap[o.customer_email]!;
    const platformName = PLATFORMS[o.platform] ?? o.platform;

    const { rows } = await db.query(
      `INSERT INTO demo_orders
         (order_number, platform, customer_id, customer_name, customer_phone,
          product_name, quantity, total_amount, status, tracking_number, carrier,
          estimated_delivery, order_date, last_updated)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
       ON CONFLICT (order_number) DO UPDATE
         SET status = EXCLUDED.status, platform = EXCLUDED.platform,
             order_date = EXCLUDED.order_date, estimated_delivery = EXCLUDED.estimated_delivery
       RETURNING order_number, status`,
      [
        o.order_number,
        platformName,
        customer.id,
        customer.name,
        customer.phone,
        o.product_name,
        o.quantity,
        o.total_amount,
        o.status,
        o.tracking_number,
        o.carrier,
        o.estimated_delivery,
        o.order_date,
      ]
    );
    const statusIcon: Record<string, string> = {
      shipped: '🚚', processing: '⚙️', delivered: '✅',
      cancelled: '❌', returned: '↩️',
    };
    console.log(
      `  ${statusIcon[rows[0].status] ?? '📦'}  [${o.order_number}] ${o.product_name} — ${rows[0].status} (${platformName})`
    );
  }

  console.log('\n✅ Demo data seeded!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' ORDER NUMBERS TO TEST WITH THE VOICE AGENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const o of orders) {
    const platformName = PLATFORMS[o.platform] ?? o.platform;
    console.log(` ${o.order_number.padEnd(12)} ${platformName.padEnd(12)} ${o.product_name.substring(0, 38)}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await db.end();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
