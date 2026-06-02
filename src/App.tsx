import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Globe2,
  IndianRupee,
  LockKeyhole,
  PlugZap,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  WalletCards,
  Zap,
} from 'lucide-react';

const metrics = [
  { label: 'Payments processed', value: '₹42.8 Cr', delta: '+18.4%' },
  { label: 'Success rate', value: '98.7%', delta: '+2.1%' },
  { label: 'Avg settlement', value: 'T+1 day', delta: 'Auto' },
];

const methods = [
  { icon: CreditCard, title: 'Cards', text: 'Credit, debit, corporate cards with token-ready flows.' },
  { icon: Smartphone, title: 'UPI', text: 'Intent, collect, QR, and autopay checkout experiences.' },
  { icon: WalletCards, title: 'Wallets', text: 'Popular wallets and stored instruments for faster repeat payments.' },
  { icon: Globe2, title: 'Net banking', text: 'Bank redirects with real-time status reconciliation.' },
];

const features = [
  'No-code payment links and hosted checkout pages',
  'Smart routing with retries and fallback processors',
  'Developer APIs, SDKs, webhooks, and sandbox keys',
  'Fraud signals, risk rules, PCI-aware token handling',
  'Instant refunds, disputes, invoices, and settlements',
  'Live operations dashboard for finance and support teams',
];

const transactions = [
  { id: 'pay_PB82J9', customer: 'Nisha Rao', method: 'UPI', amount: '₹8,499', status: 'Captured' },
  { id: 'pay_PB82K1', customer: 'Arjun Mehta', method: 'Card', amount: '₹2,100', status: 'Authorized' },
  { id: 'pay_PB82L7', customer: 'Maya Singh', method: 'Wallet', amount: '₹999', status: 'Captured' },
];

export function App() {
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="PayBridge home">
          <span className="brand-mark">PB</span>
          <span>PayBridge</span>
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#products">Products</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#developers">Developers</a>
          <a href="#security">Security</a>
        </div>
        <a className="nav-cta" href="#checkout">Launch checkout</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Zap size={16} /> Payment gateway clone starter</div>
          <h1>Accept, route, and reconcile digital payments from one elegant gateway.</h1>
          <p>
            PayBridge is a Razorpay-inspired payment gateway concept with hosted checkout,
            payment links, settlement analytics, mock transactions, and developer-ready API surfaces.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#checkout">Try demo checkout <ArrowRight size={18} /></a>
            <a className="button secondary" href="#developers">View API plan</a>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={18} /> PCI-aware UX</span>
            <span><LockKeyhole size={18} /> Tokenized cards</span>
            <span><ReceiptText size={18} /> Audit-ready logs</span>
          </div>
        </div>

        <div className="checkout-card" id="checkout" aria-label="Demo checkout card">
          <div className="checkout-header">
            <div>
              <span className="muted">Merchant</span>
              <h2>Nova Commerce</h2>
            </div>
            <span className="secure"><LockKeyhole size={14} /> Secure</span>
          </div>
          <div className="amount-box">
            <span>Total payable</span>
            <strong>₹12,499</strong>
          </div>
          <div className="payment-tabs">
            <button className="active"><QrCode size={16} /> UPI</button>
            <button><CreditCard size={16} /> Card</button>
            <button><Globe2 size={16} /> Bank</button>
          </div>
          <label className="field">
            UPI ID
            <input value="customer@upi" readOnly aria-label="Demo UPI ID" />
          </label>
          <button className="pay-button">Pay ₹12,499</button>
          <p className="fine-print">This is a front-end prototype. Connect a compliant backend before processing real money.</p>
        </div>
      </section>

      <section className="metrics" aria-label="Gateway metrics">
        {metrics.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.delta}</small>
          </article>
        ))}
      </section>

      <section className="section" id="products">
        <div className="section-heading">
          <span className="eyebrow">Products</span>
          <h2>Payment experiences for every conversion path.</h2>
        </div>
        <div className="method-grid">
          {methods.map(({ icon: Icon, title, text }) => (
            <article className="method-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard" id="dashboard">
        <div className="dashboard-copy">
          <span className="eyebrow">Operations dashboard</span>
          <h2>Monitor authorizations, captures, refunds, and settlement health.</h2>
          <p>
            Give support and finance teams a single view of payment lifecycle events, webhook
            delivery, refunds, reconciliation exports, and risk signals.
          </p>
          <ul>
            {features.map((feature) => (
              <li key={feature}><CheckCircle2 size={18} /> {feature}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <div className="panel-top">
            <h3><BarChart3 size={20} /> Live transactions</h3>
            <span>Sandbox</span>
          </div>
          <div className="chart" aria-hidden="true">
            <span style={{ height: '45%' }} />
            <span style={{ height: '72%' }} />
            <span style={{ height: '58%' }} />
            <span style={{ height: '86%' }} />
            <span style={{ height: '66%' }} />
            <span style={{ height: '94%' }} />
          </div>
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div className="transaction" key={transaction.id}>
                <div>
                  <strong>{transaction.customer}</strong>
                  <span>{transaction.id} · {transaction.method}</span>
                </div>
                <div>
                  <strong>{transaction.amount}</strong>
                  <span className="status">{transaction.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="security" id="security">
        <IndianRupee size={38} />
        <div>
          <h2>Ready to turn this into a full-stack payment platform?</h2>
          <p>
            Next steps: add authentication, merchant database models, a ledger service, webhook workers,
            processor adapters, and compliance controls before any real payment handling.
          </p>
        </div>
        <a className="button primary" href="#top">Back to top</a>
      </section>
    </main>
  );
}
