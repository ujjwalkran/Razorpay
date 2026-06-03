import { paymentMethods } from '../data/gateway';

export function Products() {
  return (
    <section className="section" id="products">
      <div className="section-heading">
        <span className="eyebrow">Products</span>
        <h2>Payment experiences for every conversion path.</h2>
      </div>
      <div className="method-grid">
        {paymentMethods.map(({ icon: Icon, title, text }) => (
          <article className="method-card" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
