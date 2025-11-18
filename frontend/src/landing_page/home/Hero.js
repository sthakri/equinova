import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row gx-lg-5 gy-5 align-items-center p-5 equinova-hero">
        <div className="col-lg-6 position-relative">
          <span className="data-pill hero-pill">
            <span className="hero-pill-dot"></span>
            Live market simulation
          </span>
          <h1 className="display-5 fw-semibold mb-3">
            Trade Smarter.
            <br />
            Evolve Faster.
          </h1>
          <p className="lead text-muted mb-4">
            EquiNova combines live market data and interactive dashboards to
            help you simulate trades, track portfolios, and grow your market
            intuition through guided practice sessions.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <a href="/signup" className="btn btn-primary btn-lg px-4">
              Get Started
            </a>
            <a href="/product" className="btn btn-outline-primary btn-lg px-4">
              Explore Dashboard
            </a>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <div className="hero-feature">
              <span
                className="hero-feature-icon"
                role="img"
                aria-label="analytics"
              >
                📈
              </span>
              Real-time performance analytics
            </div>
            <div className="hero-feature">
              <span
                className="hero-feature-icon"
                role="img"
                aria-label="learning"
              >
                🎓
              </span>
              Learn trading by doing
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="equinova-hero-visual">
            <div className="hero-card-grid">
              <div className="hero-card hero-card-main">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="hero-chip">Portfolio pulse</span>
                  <span className="hero-chip hero-chip-success">+4.8%</span>
                </div>
                <h3 className="hero-metric">$12,480</h3>
                <p className="text-muted small mb-0">
                  Practice balance across five simulated positions.
                </p>
              </div>
              <div className="hero-card hero-card-watch">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="hero-chip">Market watch</span>
                  <span className="hero-chip hero-chip-muted">Live</span>
                </div>
                <ul className="hero-card-list">
                  <li>
                    <span>TSLA</span>
                    <span className="text-success">+1.6%</span>
                  </li>
                  <li>
                    <span>NVDA</span>
                    <span className="text-success">+0.9%</span>
                  </li>
                  <li>
                    <span>ETH</span>
                    <span className="text-danger">-0.7%</span>
                  </li>
                </ul>
              </div>
              <div className="hero-card hero-card-progress">
                <span className="hero-chip mb-2">Next milestone</span>
                <h6 className="mb-1">Execute 3 simulated orders</h6>
                <p className="text-muted small mb-0">
                  Unlock advanced chart overlays once you complete this sprint.
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
