import { createServer as createHttpServer } from 'node:http';
import { authenticate } from './auth.js';
import { createDatabase } from './db.js';
import { badRequest, getHeader, notFound, parseJson, sendJson, unauthorized } from './http.js';
import { getStoredIdempotentResponse, storeIdempotentResponse } from './idempotency.js';
import { MockProcessorAdapter } from './processor.js';
import {
  createMerchant,
  createOrder,
  createPayment,
  createRefund,
  createWebhookEvent,
  getOrder,
  getPayment,
  listPayments,
  listWebhookEvents,
} from './repositories.js';

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createServer({ db = createDatabase(), processor = new MockProcessorAdapter() } = {}) {
  return createHttpServer(async (request, response) => {
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader('access-control-allow-headers', 'authorization, content-type, idempotency-key, x-api-key');
    response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      await routeRequest({ request, response, db, processor });
    } catch (error) {
      if (error instanceof SyntaxError) {
        badRequest(response, 'Request body must be valid JSON.');
        return;
      }

      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        sendJson(response, 409, { error: 'conflict', message: 'A resource with this unique field already exists.' });
        return;
      }

      sendJson(response, 500, {
        error: 'internal_error',
        message: 'Sandbox backend failed to process the request.',
      });
    }
  });
}

async function routeRequest({ request, response, db, processor }) {
  const url = new URL(request.url || '/', 'http://localhost');
  const method = request.method || 'GET';
  const path = url.pathname;

  if (method === 'GET' && path === '/health') {
    sendJson(response, 200, { status: 'ok', service: 'paybridge-sandbox-backend' });
    return;
  }

  if (method === 'POST' && path === '/v1/merchants') {
    const body = await parseJson(request);
    if (!isNonEmptyString(body.business_name) || !isEmail(body.email)) {
      badRequest(response, 'business_name and a valid email are required.');
      return;
    }

    const payload = createMerchant(db, {
      business_name: body.business_name.trim(),
      email: body.email.trim().toLowerCase(),
    });
    sendJson(response, 201, payload);
    return;
  }

  const merchant = authenticate(db, request);
  if (!merchant) {
    unauthorized(response);
    return;
  }

  if (method === 'GET' && path === '/v1/merchants/me') {
    sendJson(response, 200, { merchant });
    return;
  }

  if (method === 'POST' && path === '/v1/orders') {
    const body = await parseJson(request);
    await withIdempotency({ request, response, db, merchant, body, successStatus: 201 }, () => {
      if (!isPositiveInteger(body.amount)) return validation('amount must be a positive integer in paise.');
      if (!isCurrency(body.currency || 'INR')) return validation('currency must be a three-letter code.');

      const order = createOrder(db, merchant.id, {
        amount: body.amount,
        currency: (body.currency || 'INR').toUpperCase(),
        receipt: body.receipt || null,
        notes: body.notes || {},
      });
      const event = createWebhookEvent(db, merchant.id, 'order.created', 'order', order.id, { order });
      return { statusCode: 201, body: { order, webhook_event: event } };
    });
    return;
  }

  const orderMatch = path.match(/^\/v1\/orders\/([^/]+)$/);
  if (method === 'GET' && orderMatch) {
    const order = getOrder(db, merchant.id, orderMatch[1]);
    if (!order) return notFound(response);
    sendJson(response, 200, { order });
    return;
  }

  if (method === 'POST' && path === '/v1/payments') {
    const body = await parseJson(request);
    await withIdempotency({ request, response, db, merchant, body, successStatus: 201 }, () => {
      if (!isNonEmptyString(body.order_id)) return validation('order_id is required.');
      if (!['upi', 'card', 'bank'].includes(body.method)) return validation('method must be one of upi, card, or bank.');
      const order = getOrder(db, merchant.id, body.order_id);
      if (!order) return { statusCode: 404, body: { error: 'not_found', message: 'Order not found.' } };
      if (order.status === 'paid') return validation('Order is already paid.');

      const payment = createPayment(db, merchant.id, order, {
        method: body.method,
        method_details: body.method_details || {},
      }, processor);
      const eventType = payment.status === 'captured' ? 'payment.captured' : 'payment.failed';
      const event = createWebhookEvent(db, merchant.id, eventType, 'payment', payment.id, { payment });
      return { statusCode: 201, body: { payment, webhook_event: event } };
    });
    return;
  }

  if (method === 'GET' && path === '/v1/payments') {
    sendJson(response, 200, { payments: listPayments(db, merchant.id) });
    return;
  }

  const paymentMatch = path.match(/^\/v1\/payments\/([^/]+)$/);
  if (method === 'GET' && paymentMatch) {
    const payment = getPayment(db, merchant.id, paymentMatch[1]);
    if (!payment) return notFound(response);
    sendJson(response, 200, { payment });
    return;
  }

  if (method === 'POST' && path === '/v1/refunds') {
    const body = await parseJson(request);
    await withIdempotency({ request, response, db, merchant, body, successStatus: 201 }, () => {
      if (!isNonEmptyString(body.payment_id)) return validation('payment_id is required.');
      if (!isPositiveInteger(body.amount)) return validation('amount must be a positive integer in paise.');
      const payment = getPayment(db, merchant.id, body.payment_id);
      if (!payment) return { statusCode: 404, body: { error: 'not_found', message: 'Payment not found.' } };
      if (payment.status !== 'captured') return validation('Only captured payments can be refunded.');

      const refund = createRefund(db, merchant.id, payment, {
        amount: body.amount,
        reason: body.reason || null,
      }, processor);
      const eventType = refund.status === 'processed' ? 'refund.processed' : 'refund.failed';
      const event = createWebhookEvent(db, merchant.id, eventType, 'refund', refund.id, { refund });
      return { statusCode: 201, body: { refund, webhook_event: event } };
    });
    return;
  }

  if (method === 'GET' && path === '/v1/webhook-events') {
    sendJson(response, 200, { webhook_events: listWebhookEvents(db, merchant.id) });
    return;
  }

  const webhookDeliverMatch = path.match(/^\/v1\/webhook-events\/([^/]+)\/deliver$/);
  if (method === 'POST' && webhookDeliverMatch) {
    const deliveredAt = new Date().toISOString();
    const result = db.prepare(`
      UPDATE webhook_events
      SET delivery_status = 'delivered', attempts = attempts + 1, delivered_at = ?
      WHERE merchant_id = ? AND id = ?
    `).run(deliveredAt, merchant.id, webhookDeliverMatch[1]);

    if (result.changes === 0) return notFound(response);
    const event = db.prepare('SELECT * FROM webhook_events WHERE merchant_id = ? AND id = ?').get(merchant.id, webhookDeliverMatch[1]);
    sendJson(response, 200, { webhook_event: { ...event, payload: JSON.parse(event.payload_json), payload_json: undefined } });
    return;
  }

  notFound(response);
}

async function withIdempotency({ request, response, db, merchant, body }, handler) {
  const method = request.method || 'GET';
  const path = new URL(request.url || '/', 'http://localhost').pathname;
  const key = getHeader(request, 'idempotency-key');

  if (writeMethods.has(method) && key) {
    const stored = getStoredIdempotentResponse(db, merchant.id, key, method, path, body);
    if (stored) {
      sendJson(response, stored.statusCode, stored.body, stored.replay ? { 'idempotent-replayed': 'true' } : {});
      return;
    }
  }

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const result = handler();
    if (result.body?.error) {
      db.exec('ROLLBACK;');
      sendJson(response, result.statusCode, result.body);
      return;
    }

    storeIdempotentResponse(db, merchant.id, key, method, path, body, result.statusCode, result.body);
    db.exec('COMMIT;');
    sendJson(response, result.statusCode, result.body);
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

function validation(message) {
  return { statusCode: 400, body: { error: 'validation_error', message } };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isEmail(value) {
  return typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isCurrency(value) {
  return typeof value === 'string' && /^[A-Za-z]{3}$/.test(value);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 8787);
  const server = createServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`PayBridge sandbox backend listening on http://localhost:${port}`);
  });
}
