import { BarChart3, CheckCircle2 } from 'lucide-react';
import { features } from '../data/gateway';
import type { Transaction } from '../types/payment';

type DashboardProps = {
  transactions: Transaction[];
};

export function Dashboard({ transactions }: DashboardProps) {
  return (
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
                <span className={`status ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
