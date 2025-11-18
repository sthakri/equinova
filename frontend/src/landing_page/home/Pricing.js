import React from "react";

function Pricing() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="section-heading mb-3">
          Launch with Free. Grow into Pro.
        </h2>
        <p className="section-subtitle mx-auto">
          EquiNova’s dashboard keeps future traders sharp. Start building skills
          with authenticated sessions, live data streams, and a guided portfolio
          view while we finish crafting the full pro workspace.
        </p>
      </div>
      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="pricing-card h-100 d-flex flex-column">
            <h3 className="mb-2">Free</h3>
            <p className="text-muted">Perfect for first-time strategists.</p>
            <div className="price mb-3">$0</div>
            <ul className="list-unstyled mb-4">
              <li>
                <i className="fa-solid fa-lock text-success me-2"></i>
                Secure user authentication with multi-device sync
              </li>
              <li>
                <i className="fa-solid fa-chart-line text-success me-2"></i>
                Real-time stock snapshots refreshed every minute
              </li>
              <li>
                <i className="fa-solid fa-briefcase text-success me-2"></i>
                Portfolio overview with holdings, cash, and PnL tracking
              </li>
              <li>
                <i className="fa-solid fa-chart-pie text-success me-2"></i>
                Interactive mini-charts for top tickers and sectors
              </li>
            </ul>
            <div className="mt-auto">
              <a href="/signup" className="btn btn-outline-primary w-100">
                Activate Free Workspace
              </a>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pricing-card featured h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="mb-0">Pro</h3>
              <span className="pricing-badge">
                <i className="fa-solid fa-rocket"></i>
                Launching soon
              </span>
            </div>
            <p className="text-muted">
              Built for active paper traders and cohort teams.
            </p>
            <div className="price mb-3">
              $9<span className="fs-6 text-muted">/mo</span>
            </div>
            <ul className="list-unstyled mb-4">
              <li>
                <i className="fa-solid fa-robot text-success me-2"></i>
                Smart order management with queued buy/sell automation
              </li>
              <li>
                <i className="fa-solid fa-layer-group text-success me-2"></i>
                Streaming market depth and sentiment overlays
              </li>
              <li>
                <i className="fa-solid fa-chart-area text-success me-2"></i>
                Full-screen interactive charts with pattern capture
              </li>
              <li>
                <i className="fa-solid fa-people-arrows text-success me-2"></i>
                Team workspaces and mentor review loops
              </li>
            </ul>
            <div className="mt-auto">
              <small className="d-block text-center text-muted mb-3">
                Join the waitlist to be first when Pro unlocks.
              </small>
              <button className="btn btn-primary w-100" type="button" disabled>
                Pro in development
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
