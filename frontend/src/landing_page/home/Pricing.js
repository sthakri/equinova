import React from "react";

function Pricing() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="section-heading mb-3">Current Access</h2>
        <p className="section-subtitle mx-auto">
          Only one tier exists right now: the foundational sandbox. Future tiers
          will appear after core stability and feedback cycles.
        </p>
      </div>
      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="pricing-card h-100 d-flex flex-column">
            <h3 className="mb-2">Sandbox</h3>
            <p className="text-muted">Everything implemented so far.</p>
            <div className="price mb-3">$0</div>
            <ul className="list-unstyled mb-4">
              <li>
                <i className="fa-solid fa-lock text-success me-2"></i>
                Signup/login with secure password handling
              </li>
              <li>
                <i className="fa-solid fa-wallet text-success me-2"></i>
                Virtual wallet: starting balance $100,000
              </li>
              <li>
                <i className="fa-solid fa-right-left text-success me-2"></i>
                Simulated BUY/SELL order recording
              </li>
              <li>
                <i className="fa-solid fa-chart-line text-success me-2"></i>
                Random‑walk price feed (~3s updates)
              </li>
              <li>
                <i className="fa-solid fa-list text-success me-2"></i>
                Watchlist + transaction history basics
              </li>
            </ul>
            <div className="mt-auto">
              <a href="/signup" className="btn btn-outline-primary w-100">
                Create Sandbox Account
              </a>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pricing-card featured h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="mb-0">Planned Tier</h3>
              <span className="pricing-badge">
                <i className="fa-solid fa-rocket"></i>
                Not available
              </span>
            </div>
            <p className="text-muted">
              Potential future enhancements once foundation is stable.
            </p>
            <div className="price mb-3">TBD</div>
            <ul className="list-unstyled mb-4">
              <li>
                <i className="fa-solid fa-chart-area text-success me-2"></i>
                Historical & multi‑interval chart views
              </li>
              <li>
                <i className="fa-solid fa-tag text-success me-2"></i>
                Strategy tagging / note attachments
              </li>
              <li>
                <i className="fa-solid fa-user-group text-success me-2"></i>
                Shared workspaces / peer review
              </li>
              <li>
                <i className="fa-solid fa-bolt text-success me-2"></i>
                Conditional / queued order simulation
              </li>
            </ul>
            <div className="mt-auto">
              <small className="d-block text-center text-muted mb-3">
                Features listed are conceptual only.
              </small>
              <button className="btn btn-primary w-100" type="button" disabled>
                In exploration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
