import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row gx-lg-5 gy-5 align-items-center p-5 equinova-hero">
        <div className="col-lg-6 position-relative">
          <span className="data-pill hero-pill">
            <span className="hero-pill-dot"></span>
            Simulated market feed
          </span>
          <h1 className="display-5 fw-semibold mb-3">
            Practice Trading.
            <br />
            Build Core Skills.
          </h1>
          <p className="lead text-muted mb-4">
            A focused environment for learning order flow and portfolio impact
            using virtual funds and a controlled price simulation—without
            over‑promising features that aren’t shipped yet.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <a href="/signup" className="btn btn-primary btn-lg px-4">
              Get Started
            </a>
            <a href="/product" className="btn btn-outline-primary btn-lg px-4">
              View Components
            </a>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <div className="hero-feature">
              <span
                className="hero-feature-icon"
                role="img"
                aria-label="prices"
              >
                💹
              </span>
              Price updates ~3s
            </div>
            <div className="hero-feature">
              <span
                className="hero-feature-icon"
                role="img"
                aria-label="wallet"
              >
                💼
              </span>
              Virtual $100k balance
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="equinova-hero-visual">
            <div className="hero-card-grid">
              <div className="hero-card hero-card-main">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="hero-chip">Sample balance</span>
                  <span className="hero-chip hero-chip-success">Demo</span>
                </div>
                <h3 className="hero-metric">$100,000</h3>
                <p className="text-muted small mb-0">
                  Initial virtual funds on signup.
                </p>
              </div>
              <div className="hero-card hero-card-watch">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="hero-chip">Watchlist (sample)</span>
                  <span className="hero-chip hero-chip-muted">Live</span>
                </div>
                <ul className="hero-card-list">
                  <li>
                    <span>TSLA</span>
                    <span className="text-muted">price → updates</span>
                  </li>
                  <li>
                    <span>NVDA</span>
                    <span className="text-muted">price → updates</span>
                  </li>
                  <li>
                    <span>AAPL</span>
                    <span className="text-muted">price → updates</span>
                  </li>
                </ul>
              </div>
              <div className="hero-card hero-card-progress">
                <span className="hero-chip mb-2">Planned</span>
                <h6 className="mb-1">Chart overlays & notes</h6>
                <p className="text-muted small mb-0">
                  Not implemented yet—foundation first, tooling later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
