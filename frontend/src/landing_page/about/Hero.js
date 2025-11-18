import React from "react";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-md-6">
          <span className="community-pill mb-3">About EquiNova</span>
          <h1 className="section-heading mb-3">
            Built for learners who trade with curiosity and purpose.
          </h1>
          <p className="text-muted mb-3" style={{ lineHeight: "1.8" }}>
            We started EquiNova to make thoughtful trading practice accessible
            to anyone who wants to understand markets without the pressure of
            real capital.
          </p>
          <p className="text-muted mb-3" style={{ lineHeight: "1.8" }}>
            Today, we offer a safe, data-driven simulator that brings live
            prices, clean analytics, and guided workflows together for students
            and first-time traders.
          </p>
          <p className="text-muted mb-0" style={{ lineHeight: "1.8" }}>
            Our small team is focused on building confidence through
            experimentation—because learning the market should feel
            collaborative, transparent, and empowering.
          </p>
        </div>
        <div className="col-md-6">
          <div className="about-hero-card shadow-sm p-4 p-lg-5">
            <div className="about-hero-metric mb-4">
              <span className="hero-chip hero-chip-muted">
                Practice session
              </span>
              <h3 className="mt-3 mb-1">Live Market Sandbox</h3>
              <p className="text-muted mb-0">
                Track simulated positions, test strategies, and log feedback in
                real time.
              </p>
            </div>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="hero-chip hero-chip-success">+3.2%</span>
                  <p className="mb-0 text-muted small">
                    Weekly paper portfolio trend
                  </p>
                </div>
                <span className="text-muted small">Updated moments ago</span>
              </div>
              <div className="about-hero-divider"></div>
              <div>
                <p className="mb-1 fw-semibold">What we're improving next</p>
                <ul className="list-unstyled mb-0 text-muted small">
                  <li>Shared cohorts for campus clubs</li>
                  <li>Scenario-driven missions for new traders</li>
                  <li>Optional mentor feedback loops</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
