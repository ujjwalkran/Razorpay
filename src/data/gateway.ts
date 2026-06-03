import { CreditCard, Globe2, Smartphone, WalletCards } from 'lucide-react';
import type { Metric, PaymentMethodCard, Transaction } from '../types/payment';

export const metrics: Metric[] = [
  { label: 'Payments processed', value: '₹42.8 Cr', delta: '+18.4%' },
  { label: 'Success rate', value: '98.7%', delta: '+2.1%' },
  { label: 'Avg settlement', value: 'T+1 day', delta: 'Auto' },
];

export const paymentMethods: PaymentMethodCard[] = [
  { icon: CreditCard, title: 'Cards', text: 'Credit, debit, corporate cards with token-ready flows.' },
  { icon: Smartphone, title: 'UPI', text: 'Intent, collect, QR, and autopay checkout experiences.' },
  { icon: WalletCards, title: 'Wallets', text: 'Popular wallets and stored instruments for faster repeat payments.' },
  { icon: Globe2, title: 'Net banking', text: 'Bank redirects with real-time status reconciliation.' },
];

export const features = [
  'No-code payment links and hosted checkout pages',
  'Smart routing with retries and fallback processors',
  'Developer APIs, SDKs, webhooks, and sandbox keys',
  'Fraud signals, risk rules, PCI-aware token handling',
  'Instant refunds, disputes, invoices, and settlements',
  'Live operations dashboard for finance and support teams',
];

export const seedTransactions: Transaction[] = [
  { id: 'pay_PB82J9', customer: 'Nisha Rao', method: 'UPI', amount: '₹8,499', status: 'Captured' },
  { id: 'pay_PB82K1', customer: 'Arjun Mehta', method: 'Card', amount: '₹2,100', status: 'Authorized' },
  { id: 'pay_PB82L7', customer: 'Maya Singh', method: 'Wallet', amount: '₹999', status: 'Captured' },
];

export const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'];
