import { createHash } from 'node:crypto';
import { nowIso } from './ids.js';

export function requestHash(body) {
  return createHash('sha256').update(JSON.stringify(body ?? {})).digest('hex');
}

export function getStoredIdempotentResponse(db, merchantId, key, method, path, body) {
  if (!key) return null;
  const existing = db.prepare('SELECT * FROM idempotency_keys WHERE merchant_id = ? AND \`key\` = ?').get(merchantId, key);
  if (!existing) return null;

  const incomingHash = requestHash(body);
  if (existing.method !== method || existing.path !== path || existing.request_hash !== incomingHash) {
    return {
      conflict: true,
      statusCode: 409,
      body: {
        error: 'idempotency_key_conflict',
        message: 'This idempotency key was already used with a different request.',
      },
    };
  }

  return {
    replay: true,
    statusCode: existing.status_code,
    body: JSON.parse(existing.response_json),
  };
}

export function storeIdempotentResponse(db, merchantId, key, method, path, body, statusCode, responseBody) {
  if (!key) return;
  db.prepare(`
    INSERT INTO idempotency_keys (merchant_id, \`key\`, method, path, request_hash, status_code, response_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(merchantId, key, method, path, requestHash(body), statusCode, JSON.stringify(responseBody), nowIso());
}
