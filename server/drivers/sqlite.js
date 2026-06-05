import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function createSqliteDatabase(config) {
  const dbPath = config.path || 'data/paybridge-sandbox.sqlite';
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'sandbox_active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_used_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      amount INTEGER NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL,
      receipt TEXT,
      status TEXT NOT NULL,
      notes_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      order_id TEXT NOT NULL REFERENCES orders(id),
      amount INTEGER NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      processor_reference TEXT,
      failure_code TEXT,
      failure_reason TEXT,
      method_details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      payment_id TEXT NOT NULL REFERENCES payments(id),
      amount INTEGER NOT NULL CHECK (amount > 0),
      status TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      event_type TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      delivery_status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      delivered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      key TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      request_hash TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (merchant_id, key)
    );
  `);
}
