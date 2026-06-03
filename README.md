# PayBridge Payment Gateway Prototype

PayBridge is a Razorpay-inspired payment gateway clone starter built with React, TypeScript, Vite, and a Node.js sandbox backend. It demonstrates a polished marketing site, hosted checkout concept, payment-method cards, live transaction dashboard, a mock REST API, API-key authentication, idempotent writes, webhook events, and a production roadmap for a full-stack payment platform.

## Implementation plan

1. **Merchant onboarding**: business profile, KYB/KYC state, team roles, API key rotation, webhook endpoint management, and bank-account verification.
2. **Order and payment APIs**: authenticated APIs to create orders, initialize payments, capture/void authorizations, issue refunds, and emit idempotent lifecycle events.
3. **Checkout experiences**: hosted checkout, payment links, embeddable SDK, UPI collect/intent, QR payments, card tokenization, wallet flows, invoices, and subscriptions.
4. **Payment orchestration**: processor adapters, smart routing, retry/fallback rules, fraud checks, token vault integration, and reconciliation-safe status transitions.
5. **Ledger and settlements**: immutable merchant ledger, fees/taxes, settlement batches, bank transfers, refund adjustments, disputes, exports, and reports.
6. **Reliability and compliance**: webhook workers, audit logs, PCI-aware boundaries, secrets management, monitoring, rate limits, alerts, and disaster recovery.

## Running locally

Install dependencies and start the front-end:

```bash
npm install
npm run dev
```

Start the sandbox backend in another terminal:

```bash
npm run backend
```

The backend listens on `http://localhost:8787` by default and stores sandbox data in `data/paybridge-sandbox.sqlite`. Set `PORT` or `PAYBRIDGE_DB_PATH` to override those defaults.

## Sandbox backend API

Create a merchant and sandbox API key:

```bash
curl -X POST http://localhost:8787/v1/merchants \
  -H 'content-type: application/json' \
  -d '{"business_name":"Nova Commerce","email":"ops@nova.test"}'
```

Use the returned `api_key.key` as `Authorization: Bearer <key>` for protected APIs.

Create an order with idempotency:

```bash
curl -X POST http://localhost:8787/v1/orders \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <key>' \
  -H 'idempotency-key: order-demo-001' \
  -d '{"amount":1249900,"currency":"INR","receipt":"order_1024"}'
```

Capture a mock payment:

```bash
curl -X POST http://localhost:8787/v1/payments \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <key>' \
  -H 'idempotency-key: payment-demo-001' \
  -d '{"order_id":"<order_id>","method":"card","method_details":{"card_number":"4242424242424242","cardholder_name":"Nova Customer"}}'
```

Refund a captured payment:

```bash
curl -X POST http://localhost:8787/v1/refunds \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <key>' \
  -H 'idempotency-key: refund-demo-001' \
  -d '{"payment_id":"<payment_id>","amount":50000,"reason":"requested_by_customer"}'
```

Inspect webhook events:

```bash
curl http://localhost:8787/v1/webhook-events \
  -H 'authorization: Bearer <key>'
```

Run the backend smoke test:

```bash
npm run backend:smoke
```

## Production readiness note

This repository currently contains a front-end prototype and a local sandbox backend only. Do not process real payments until a compliant production backend, processor integration, security review, and legal/compliance controls are implemented.
