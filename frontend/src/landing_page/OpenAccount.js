import React from "react";

function OpenAccount() {
  return (
    <section className="container py-5">
      <div className="open-account-card text-center mx-auto">
        <h2 className="section-heading mb-3">Create your EquiNova account</h2>
        <p className="section-subtitle mx-auto mb-4">
          Track live prices, place simulated orders, and analyze your
          portfolio—risk-free.
        </p>
        <button
          className="btn btn-primary btn-lg open-account-button"
          type="button"
        >
          Sign up free
        </button>
      </div>
    </section>
  );
}

export default OpenAccount;
