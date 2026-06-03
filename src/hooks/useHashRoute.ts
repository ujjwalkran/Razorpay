import { useEffect, useMemo, useState } from 'react';

const routes = new Set(['home', 'checkout', 'products', 'dashboard', 'developers', 'security']);

function getRouteFromHash() {
  const hash = window.location.hash;
  const route = hash.startsWith('#/') ? hash.replace('#/', '') : hash.replace('#', '') || 'home';
  return routes.has(route) ? route : 'home';
}

export function useHashRoute() {
  const [route, setRoute] = useState(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return useMemo(() => ({ route, isHome: route === 'home' || route === 'checkout' }), [route]);
}
