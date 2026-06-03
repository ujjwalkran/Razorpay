import { randomBytes } from 'node:crypto';

const prefixes = {
  merchant: 'merch',
  apiKey: 'key',
  order: 'order',
  payment: 'pay',
  refund: 'rfnd',
  webhook: 'evt',
  processor: 'proc',
};

export function createId(type) {
  return `${prefixes[type] || type}_${randomBytes(9).toString('base64url')}`;
}

export function nowIso() {
  return new Date().toISOString();
}
