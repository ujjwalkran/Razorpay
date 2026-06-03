import { ArrowRight, LockKeyhole, ReceiptText, ShieldCheck, Zap } from 'lucide-react';
import { CheckoutCard } from './CheckoutCard';
import type { Transaction } from '../types/payment';

type HeroProps = {
  onTransaction: (transaction: Transaction) => void;
};

export function Hero({ onTransaction }: HeroProps) {
  return (
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
          <a className="button secondary" href="#/developers">View API plan</a>
        </div>
        <div className="trust-row">
          <span><ShieldCheck size={18} /> PCI-aware UX</span>
          <span><LockKeyhole size={18} /> Tokenized cards</span>
          <span><ReceiptText size={18} /> Audit-ready logs</span>
        </div>
      </div>
      <CheckoutCard onTransaction={onTransaction} />
    </section>
  );
}
