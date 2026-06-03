import { rowToJson } from './db.js';
import { createApiKey } from './auth.js';
import { createId, nowIso } from './ids.js';

export function createMerchant(db, { business_name, email }) {
  const merchant = {
    id: createId('merchant'),
    business_name,
    email,
    status: 'sandbox_active',
    created_at: nowIso(),
  };
  db.prepare(`
    INSERT INTO merchants (id, business_name, email, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(merchant.id, merchant.business_name, merchant.email, merchant.status, merchant.created_at);
  const api_key = createApiKey(db, merchant.id);
  return { merchant, api_key };
}

export function createOrder(db, merchantId, { amount, currency = 'INR', receipt = null, notes = {} }) {
  const timestamp = nowIso();
  const order = {
    id: createId('order'),
    merchant_id: merchantId,
    amount,
    currency,
    receipt,
    status: 'created',
    notes_json: JSON.stringify(notes),
    created_at: timestamp,
    updated_at: timestamp,
  };
  db.prepare(`
    INSERT INTO orders (id, merchant_id, amount, currency, receipt, status, notes_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(order.id, order.merchant_id, order.amount, order.currency, order.receipt, order.status, order.notes_json, order.created_at, order.updated_at);
  return rowToJson(order, ['notes_json']);
}

export function getOrder(db, merchantId, orderId) {
  return rowToJson(db.prepare('SELECT * FROM orders WHERE merchant_id = ? AND id = ?').get(merchantId, orderId), ['notes_json']);
}

export function createPayment(db, merchantId, order, { method, method_details = {} }, processor) {
  const timestamp = nowIso();
  const result = processor.authorizeAndCapture({ amount: order.amount, method, methodDetails: method_details });
  const payment = {
    id: createId('payment'),
    merchant_id: merchantId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    method,
    status: result.status,
    processor_reference: result.processor_reference,
    failure_code: result.failure_code,
    failure_reason: result.failure_reason,
    method_details_json: JSON.stringify(maskMethodDetails(method_details)),
    created_at: timestamp,
    updated_at: timestamp,
  };

  db.prepare(`
    INSERT INTO payments (id, merchant_id, order_id, amount, currency, method, status, processor_reference, failure_code, failure_reason, method_details_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(payment.id, payment.merchant_id, payment.order_id, payment.amount, payment.currency, payment.method, payment.status, payment.processor_reference, payment.failure_code, payment.failure_reason, payment.method_details_json, payment.created_at, payment.updated_at);

  const orderStatus = payment.status === 'captured' ? 'paid' : 'payment_failed';
  db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND merchant_id = ?').run(orderStatus, timestamp, order.id, merchantId);
  return rowToJson(payment, ['method_details_json']);
}

export function getPayment(db, merchantId, paymentId) {
  return rowToJson(db.prepare('SELECT * FROM payments WHERE merchant_id = ? AND id = ?').get(merchantId, paymentId), ['method_details_json']);
}

export function listPayments(db, merchantId) {
  return db.prepare('SELECT * FROM payments WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 50').all(merchantId).map((row) => rowToJson(row, ['method_details_json']));
}

export function createRefund(db, merchantId, payment, { amount, reason = null }, processor) {
  const capturedAmount = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS amount FROM payments
    WHERE merchant_id = ? AND id = ? AND status = 'captured'
  `).get(merchantId, payment.id).amount;
  const refundedAmount = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS amount FROM refunds
    WHERE merchant_id = ? AND payment_id = ? AND status = 'processed'
  `).get(merchantId, payment.id).amount;
  const result = processor.refund({ amount, capturedAmount, refundedAmount });
  const timestamp = nowIso();
  const refund = {
    id: createId('refund'),
    merchant_id: merchantId,
    payment_id: payment.id,
    amount,
    status: result.status,
    reason,
    created_at: timestamp,
    updated_at: timestamp,
  };
  db.prepare(`
    INSERT INTO refunds (id, merchant_id, payment_id, amount, status, reason, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(refund.id, refund.merchant_id, refund.payment_id, refund.amount, refund.status, refund.reason, refund.created_at, refund.updated_at);
  return refund;
}

export function createWebhookEvent(db, merchantId, eventType, resourceType, resourceId, payload) {
  const event = {
    id: createId('webhook'),
    merchant_id: merchantId,
    event_type: eventType,
    resource_type: resourceType,
    resource_id: resourceId,
    payload_json: JSON.stringify(payload),
    delivery_status: 'pending',
    attempts: 0,
    created_at: nowIso(),
    delivered_at: null,
  };
  db.prepare(`
    INSERT INTO webhook_events (id, merchant_id, event_type, resource_type, resource_id, payload_json, delivery_status, attempts, created_at, delivered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(event.id, event.merchant_id, event.event_type, event.resource_type, event.resource_id, event.payload_json, event.delivery_status, event.attempts, event.created_at, event.delivered_at);
  return rowToJson(event, ['payload_json']);
}

export function listWebhookEvents(db, merchantId) {
  return db.prepare('SELECT * FROM webhook_events WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 50').all(merchantId).map((row) => rowToJson(row, ['payload_json']));
}

function maskMethodDetails(details) {
  if (!details.card_number) return details;
  const digits = String(details.card_number).replace(/\D/g, '');
  return { ...details, card_number: digits ? `**** **** **** ${digits.slice(-4)}` : undefined };
}
