import React from "react";

function Brokerage() {
  return (
    <section className="container py-5">
      <div className="text-center mb-5">
        <span className="community-pill mb-3">Access</span>
        <h2 className="section-heading mb-3">Single sandbox tier for now.</h2>
        <p className="section-subtitle mx-auto">
          Only foundational mechanics are live. Additional tiers will be
          evaluated after stability and feedback, not promised early.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="pricing-card h-100 d-flex flex-column">
            <h3 className="mb-2">Sandbox</h3>
            <p className="text-muted">Current implemented functionality.</p>
            <div className="price mb-3">$0</div>
            <ul className="list-unstyled mb-4">
              <li>Secure email/password signup & login</li>
              <li>Virtual wallet with $100,000 starting balance</li>
              <li>Random‑walk simulated symbol price updates (~3s)</li>
              <li>Paper BUY/SELL order recording with balance adjustment</li>
              <li>Holdings & transaction history basics</li>
            </ul>
            <div className="mt-auto">
              <a href="/signup" className="btn btn-primary w-100">
                Create sandbox account
              </a>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pricing-card featured h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="mb-0">Future (concept)</h3>
              <span className="pricing-badge">
                <i className="fa-solid fa-rocket"></i>
                Not available
              </span>
            </div>
            <p className="text-muted">
              Exploratory ideas—none implemented yet.
            </p>
            <div className="price mb-3">TBD</div>
            <ul className="list-unstyled mb-4">
              <li>Historical & multi‑interval chart views</li>
              <li>Strategy tagging & note attachments</li>
              <li>Shared workspaces / peer collaboration</li>
              <li>Conditional / queued order simulation</li>
            </ul>
            <div className="mt-auto">
              <button className="btn btn-outline-primary w-100" disabled>
                Concepts only
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-muted mt-5 mb-0 small">
        No brokerage integration, no real market feed, no analytics layer
        yet—this is a learning sandbox.
      </p>
    </section>
  );
}

export default Brokerage;
