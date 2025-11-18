import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center text-center">
        <div className="col-lg-8">
          <h1 className="section-heading mb-3">
            Practice trading, completely free.
          </h1>
          <p className="section-subtitle mx-auto">
            EquiNova gives you live data, a simulated portfolio, and unlimited
            practice — no brokerage, no risk.
          </p>
        </div>
      </div>
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">No cost, no risk</h5>
            <p className="text-muted mb-0">
              Learn with virtual funds and focus on the craft without touching
              real capital.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">Live market data</h5>
            <p className="text-muted mb-0">
              Track authentic price movement powered by curated market API
              feeds.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">Analytics included</h5>
            <p className="text-muted mb-0">
              Explore charts and portfolio insights that highlight patterns as
              you practice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
