import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-md-6">
          <span className="community-pill mb-3">About EquiNova</span>
          <h1 className="section-heading mb-3">
            A practical simulated trading & portfolio practice environment.
          </h1>
          <p className="text-muted mb-3" style={{ lineHeight: "1.75" }}>
            EquiNova is a sandbox for learning core market concepts without
            risking real funds. Users sign up, receive an initial virtual
            balance, and can place simulated BUY/SELL orders while tracking a
            holdings list, wallet balance, and transaction history.
          </p>
          <p className="text-muted mb-3" style={{ lineHeight: "1.75" }}>
            A built‑in market data service generates evolving prices for a set
            of commonly watched symbols using a controlled random walk. This
            lets you practice order timing, observe price movement, and review
            position changes as if watching a live tape.
          </p>
          <p className="text-muted mb-0" style={{ lineHeight: "1.75" }}>
            Current implemented features: secure signup/login, wallet with
            starting balance ($100,000), simulated order processing with balance
            debits/credits, position and transaction tracking, and a streaming
            watchlist feed. More advanced analytics, education modules, and
            sharing features are not yet built.
          </p>
        </div>
        <div className="col-md-6">
          <div className="about-hero-card shadow-sm p-4 p-lg-5">
            <div className="about-hero-metric mb-4">
              <span className="hero-chip hero-chip-muted">System snapshot</span>
              <h3 className="mt-3 mb-1">What runs today</h3>
              <p className="text-muted mb-0">
                Auth, wallet/transactions, simulated quotes, and order flow
                persistence.
              </p>
            </div>
            <div className="about-hero-divider mb-3"></div>
            <div>
              <p className="mb-1 fw-semibold">Planned (not implemented yet)</p>
              <ul className="list-unstyled mb-0 text-muted small">
                <li>Chart overlays & historical metrics</li>
                <li>Strategy tagging / notes</li>
                <li>Optional peer sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
