import { IndianRupee } from 'lucide-react';

export function Security() {
  return (
    <section className="security" id="security">
      <IndianRupee size={38} />
      <div>
        <h2>Ready to turn this into a full-stack payment platform?</h2>
        <p>
          Next steps: add authentication, merchant database models, a ledger service, webhook workers,
          processor adapters, and compliance controls before any real payment handling.
        </p>
      </div>
      <a className="button primary" href="#/home">Back to top</a>
    </section>
  );
}
