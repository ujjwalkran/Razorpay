import { strict as assert } from 'node:assert';
import { once } from 'node:events';
import { createDatabase } from './db.js';
import { createServer } from './index.js';

const db = createDatabase(':memory:');
const server = createServer({ db });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

async function jsonFetch(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return { response, body: await response.json() };
}

try {
  const health = await jsonFetch('/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.status, 'ok');

  const merchantResult = await jsonFetch('/v1/merchants', {
    method: 'POST',
    body: JSON.stringify({ business_name: 'Nova Commerce', email: 'ops@nova.test' }),
  });
  assert.equal(merchantResult.response.status, 201);
  assert.ok(merchantResult.body.api_key.key.startsWith('pb_test_'));

  const authHeaders = { authorization: `Bearer ${merchantResult.body.api_key.key}` };
  const orderResult = await jsonFetch('/v1/orders', {
    method: 'POST',
    headers: { ...authHeaders, 'idempotency-key': 'order-001' },
    body: JSON.stringify({ amount: 1249900, currency: 'INR', receipt: 'receipt_001' }),
  });
  assert.equal(orderResult.response.status, 201);
  assert.equal(orderResult.body.order.status, 'created');

  const replayedOrder = await jsonFetch('/v1/orders', {
    method: 'POST',
    headers: { ...authHeaders, 'idempotency-key': 'order-001' },
    body: JSON.stringify({ amount: 1249900, currency: 'INR', receipt: 'receipt_001' }),
  });
  assert.equal(replayedOrder.response.status, 201);
  assert.equal(replayedOrder.response.headers.get('idempotent-replayed'), 'true');
  assert.equal(replayedOrder.body.order.id, orderResult.body.order.id);

  const paymentResult = await jsonFetch('/v1/payments', {
    method: 'POST',
    headers: { ...authHeaders, 'idempotency-key': 'payment-001' },
    body: JSON.stringify({
      order_id: orderResult.body.order.id,
      method: 'card',
      method_details: { card_number: '4242424242424242', cardholder_name: 'Nova Customer' },
    }),
  });
  assert.equal(paymentResult.response.status, 201);
  assert.equal(paymentResult.body.payment.status, 'captured');
  assert.equal(paymentResult.body.payment.method_details.card_number, '**** **** **** 4242');

  const refundResult = await jsonFetch('/v1/refunds', {
    method: 'POST',
    headers: { ...authHeaders, 'idempotency-key': 'refund-001' },
    body: JSON.stringify({ payment_id: paymentResult.body.payment.id, amount: 50000, reason: 'requested_by_customer' }),
  });
  assert.equal(refundResult.response.status, 201);
  assert.equal(refundResult.body.refund.status, 'processed');

  const eventsResult = await jsonFetch('/v1/webhook-events', { headers: authHeaders });
  assert.equal(eventsResult.response.status, 200);
  assert.ok(eventsResult.body.webhook_events.length >= 3);

  console.log('Sandbox backend smoke test passed.');
} finally {
  server.close();
}
