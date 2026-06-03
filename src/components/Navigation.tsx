type NavigationProps = {
  activeRoute: string;
};

const links = [
  { href: '#/products', label: 'Products', route: 'products' },
  { href: '#/dashboard', label: 'Dashboard', route: 'dashboard' },
  { href: '#/developers', label: 'Developers', route: 'developers' },
  { href: '#/security', label: 'Security', route: 'security' },
];

export function Navigation({ activeRoute }: NavigationProps) {
  return (
    <nav className="nav">
      <a className="brand" href="#/home" aria-label="PayBridge home">
        <span className="brand-mark">PB</span>
        <span>PayBridge</span>
      </a>
      <div className="nav-links" aria-label="Primary navigation">
        {links.map((link) => (
          <a className={activeRoute === link.route ? 'active-link' : undefined} href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <a className="nav-cta" href="#checkout">Launch checkout</a>
    </nav>
  );
}
