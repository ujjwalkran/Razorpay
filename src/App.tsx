import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Developers } from './components/Developers';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Navigation } from './components/Navigation';
import { Products } from './components/Products';
import { Security } from './components/Security';
import { metrics, seedTransactions } from './data/gateway';
import { useHashRoute } from './hooks/useHashRoute';
import type { Transaction } from './types/payment';

export function App() {
  const { route, isHome } = useHashRoute();
  const [transactions, setTransactions] = useState(seedTransactions);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((currentTransactions) => [transaction, ...currentTransactions].slice(0, 6));
  };

  return (
    <main>
      <Navigation activeRoute={route} />
      {isHome && (
        <>
          <Hero onTransaction={addTransaction} />
          <Metrics metrics={metrics} />
        </>
      )}
      {(isHome || route === 'products') && <Products />}
      {(isHome || route === 'dashboard') && <Dashboard transactions={transactions} />}
      {(isHome || route === 'developers') && <Developers />}
      {(isHome || route === 'security') && <Security />}
    </main>
  );
}
