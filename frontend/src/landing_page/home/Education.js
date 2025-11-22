import React from "react";

function Education() {
  return (
    <section className="container py-5">
      <div className="community-wrap p-5">
        <div className="text-center mb-4">
          <span className="community-pill mb-3">Learning Approach</span>
          <h2 className="section-heading mb-3">Focused, hands-on practice.</h2>
          <p className="section-subtitle mx-auto">
            No formal curriculum or social layer yet. The current build lets you
            learn by placing simulated orders, watching controlled price
            movement, and reviewing balances and transaction records.
          </p>
        </div>
        <div
          className="text-center text-md-start mx-auto"
          style={{ maxWidth: "720px" }}
        >
          <p className="text-muted mb-3" style={{ lineHeight: 1.7 }}>
            Planned learning features (not implemented): guided trade missions,
            tagging strategies, collaborative review spaces. These will appear
            only after the core mechanics are fully stable.
          </p>
          <p className="text-muted mb-0 small" style={{ lineHeight: 1.6 }}>
            For now: experiment, take notes externally, and treat this as a
            sandbox for understanding order outcomes and cash flow.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Education;
