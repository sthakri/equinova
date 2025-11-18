import React from "react";

function Stats() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="section-heading mb-3">How EquiNova Works</h2>
        <p className="section-subtitle mx-auto">
          A streamlined flow helps new traders get from sign-up to meaningful
          insights without friction.
        </p>
      </div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h5>Create an account</h5>
            <p>
              Sign up with secure authentication to keep every device in sync
              from day one.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h5>Track live stocks</h5>
            <p>
              Stream curated watchlists and see price action update in real time
              as you learn.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-exchange-alt"></i>
            </div>
            <h5>Trade with virtual cash</h5>
            <p>
              Place simulated buy and sell orders to test your ideas without
              risking capital.
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h5>Analyze portfolio performance</h5>
            <p>
              Review holdings and charts that surface trends, strengths, and
              focus areas fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
