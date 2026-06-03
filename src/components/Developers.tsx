import { PlugZap } from 'lucide-react';

export function Developers() {
  return (
    <section className="developer-section" id="developers">
      <div>
        <span className="eyebrow">Implementation plan</span>
        <h2>From prototype to production-grade gateway.</h2>
      </div>
      <div className="roadmap">
        <article><span>01</span><h3>Merchant onboarding</h3><p>KYB profile, API keys, webhook endpoints, bank account verification, and role-based dashboard access.</p></article>
        <article><span>02</span><h3>Payment orchestration</h3><p>Create orders, tokenize instruments, run risk checks, route to processors, and store lifecycle events.</p></article>
        <article><span>03</span><h3>Checkout channels</h3><p>Hosted checkout, payment links, invoices, subscriptions, QR, UPI collect, and embeddable SDK widgets.</p></article>
        <article><span>04</span><h3>Money movement</h3><p>Captures, refunds, disputes, ledger entries, settlement batches, reconciliation reports, and notifications.</p></article>
      </div>
      <div className="code-card">
        <div><PlugZap size={18} /> API preview</div>
        <pre>{`POST /v1/orders
{
  "amount": 1249900,
  "currency": "INR",
  "receipt": "order_1024",
  "webhook_url": "https://merchant.app/hooks/payments"
}`}</pre>
      </div>
    </section>
  );
}
