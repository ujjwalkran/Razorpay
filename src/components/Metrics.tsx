import type { Metric } from '../types/payment';

type MetricsProps = {
  metrics: Metric[];
};

export function Metrics({ metrics }: MetricsProps) {
  return (
    <section className="metrics" aria-label="Gateway metrics">
      {metrics.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.delta}</small>
        </article>
      ))}
    </section>
  );
}
