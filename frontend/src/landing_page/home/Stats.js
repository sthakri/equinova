import React from "react";

function Stats() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="section-heading mb-3">Core Usage Flow</h2>
        <p className="section-subtitle mx-auto">
          The current implementation focuses on essential mechanics. Each step
          below maps directly to shipped functionality—no filler.
        </p>
      </div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h5>Sign up</h5>
            <p>Create an account and receive a virtual starting balance.</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h5>Watch prices</h5>
            <p>Observe simulated symbol updates every few seconds.</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-right-left"></i>
            </div>
            <h5>Place orders</h5>
            <p>Execute paper BUY/SELL and see wallet balance adjust.</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="process-card h-100">
            <div className="process-icon">
              <i className="fa-solid fa-list"></i>
            </div>
            <h5>Review records</h5>
            <p>Check holdings & transaction history for outcome tracking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
