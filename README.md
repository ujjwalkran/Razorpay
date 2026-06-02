# PayBridge Payment Gateway Prototype

PayBridge is a Razorpay-inspired payment gateway clone starter built with React, TypeScript, and Vite. It demonstrates a polished marketing site, hosted checkout concept, payment-method cards, live transaction dashboard, and a production roadmap for a full-stack payment platform.

## Implementation plan

1. **Merchant onboarding**: business profile, KYB/KYC state, team roles, API key rotation, webhook endpoint management, and bank-account verification.
2. **Order and payment APIs**: authenticated APIs to create orders, initialize payments, capture/void authorizations, issue refunds, and emit idempotent lifecycle events.
3. **Checkout experiences**: hosted checkout, payment links, embeddable SDK, UPI collect/intent, QR payments, card tokenization, wallet flows, invoices, and subscriptions.
4. **Payment orchestration**: processor adapters, smart routing, retry/fallback rules, fraud checks, token vault integration, and reconciliation-safe status transitions.
5. **Ledger and settlements**: immutable merchant ledger, fees/taxes, settlement batches, bank transfers, refund adjustments, disputes, exports, and reports.
6. **Reliability and compliance**: webhook workers, audit logs, PCI-aware boundaries, secrets management, monitoring, rate limits, alerts, and disaster recovery.

## Running locally

```bash
npm install
npm run dev
```

## Production readiness note

This repository currently contains a front-end prototype only. Do not process real payments until a compliant backend, processor integration, security review, and legal/compliance controls are implemented.
