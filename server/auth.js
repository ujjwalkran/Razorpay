import { createHash, randomBytes } from 'node:crypto';
import { getHeader } from './http.js';
import { createId, nowIso } from './ids.js';

export function hashApiKey(apiKey) {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function createApiKey(db, merchantId) {
  const secret = `pb_test_${randomBytes(24).toString('base64url')}`;
  const id = createId('apiKey');
  db.prepare(`
    INSERT INTO api_keys (id, merchant_id, key_prefix, key_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, merchantId, secret.slice(0, 15), hashApiKey(secret), nowIso());
  return { id, key: secret, prefix: secret.slice(0, 15) };
}

export function getApiKeyFromRequest(request) {
  const authorization = getHeader(request, 'authorization');
  if (authorization.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim();
  return getHeader(request, 'x-api-key');
}

export function authenticate(db, request) {
  const apiKey = getApiKeyFromRequest(request);
  if (!apiKey) return null;

  const keyHash = hashApiKey(apiKey);
  const row = db.prepare(`
    SELECT merchants.*
    FROM api_keys
    JOIN merchants ON merchants.id = api_keys.merchant_id
    WHERE api_keys.key_hash = ?
  `).get(keyHash);

  if (row) {
    db.prepare('UPDATE api_keys SET last_used_at = ? WHERE key_hash = ?').run(nowIso(), keyHash);
  }

  return row || null;
}
