import React from "react";

function Brokerage() {
  return (
    <section className="container py-5">
      <div className="text-center mb-5">
        <span className="community-pill mb-3">Plans</span>
        <h2 className="section-heading mb-3">
          Choose the path that fits today.
        </h2>
        <p className="section-subtitle mx-auto">
          Start free with everything you need to learn. When you’re ready, go
          pro for automation and deeper analysis.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="pricing-card h-100 d-flex flex-column">
            <h3 className="mb-2">Free</h3>
            <p className="text-muted">Perfect for first-time strategists.</p>
            <div className="price mb-3">$0</div>
            <ul className="list-unstyled mb-4">
              <li>Secure sign-in with synced devices</li>
              <li>Live market snapshots refreshed every minute</li>
              <li>Portfolio overview with holdings and P&amp;L tracking</li>
              <li>Interactive charts for top watchlist symbols</li>
            </ul>
            <div className="mt-auto">
              <a href="/signup" className="btn btn-primary w-100">
                Get started free
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
                Coming soon
              </span>
            </div>
            <p className="text-muted">
              Built for active paper traders, mentors, and cohort teams.
            </p>
            <div className="price mb-3">
              $9<span className="fs-6 text-muted">/mo</span>
            </div>
            <ul className="list-unstyled mb-4">
              <li>Automated order queues and scenario testing</li>
              <li>Streaming market depth with sentiment overlays</li>
              <li>Full-screen analytics with pattern tracking</li>
              <li>Shared workspaces with mentor feedback loops</li>
            </ul>
            <div className="mt-auto">
              <button className="btn btn-outline-primary w-100" disabled>
                Join waitlist soon
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-muted mt-5 mb-0">
        EquiNova is built for learners. No fees, no brokerage — just tools to
        help you understand the markets.
      </p>
    </section>
  );
}

export default Brokerage;
