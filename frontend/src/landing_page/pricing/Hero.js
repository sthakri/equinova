import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center text-center">
        <div className="col-lg-8">
          <h1 className="section-heading mb-3">
            Practice trading with a simulated feed.
          </h1>
          <p className="section-subtitle mx-auto">
            EquiNova provides a virtual starting balance and a controlled
            random‑walk price simulation. No real market data, no analytics
            layer yet—just the foundation for paper order practice.
          </p>
        </div>
      </div>
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">Virtual funds</h5>
            <p className="text-muted mb-0">
              Accounts start with a $100,000 sandbox balance.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">Simulated prices</h5>
            <p className="text-muted mb-0">
              Symbol values update every few seconds via random walk.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card h-100 text-center">
            <h5 className="mb-2">Order tracking</h5>
            <p className="text-muted mb-0">
              BUY/SELL actions adjust wallet and appear in history.
            </p>
          </div>
        </div>
      </div>
      <div className="gradient-divider"></div>
      <div className="row justify-content-center text-center mt-4">
        <div className="col-lg-8">
          <p className="small text-muted mb-0">
            Planned (not implemented): historical charts, strategy notes, shared
            workspaces.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
