import React from "react";

function Team() {
  return (
    <section className="container py-5">
      <div className="text-center mb-4">
        <span className="community-pill mb-3">Team</span>
        <h2 className="section-heading mb-2">Who built EquiNova?</h2>
        <p className="section-subtitle mx-auto">
          EquiNova is currently maintained as a solo learning project focused on
          core simulated trading mechanics and clean, reviewable code.
        </p>
      </div>
      <div className="team-card mx-auto text-center p-4 p-lg-5">
        <div className="team-avatar mx-auto mb-4">KS</div>
        <h3 className="h5 mb-1">Kritagya Shrestha</h3>
        <p className="text-muted small mb-3">Developer</p>
        <p className="text-muted mb-3" style={{ lineHeight: "1.8" }}>
          Working on foundational pieces: auth, wallet/transaction logic,
          simulated market data streaming, and a pragmatic React interface for
          placing and reviewing paper trades. The goal: a transparent base that
          can be extended—without pretending finished features exist yet.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a
            href="https://github.com/sthakri/equinova"
            className="team-link"
            target="_blank"
            rel="noreferrer"
          >
            Repository
          </a>
          <a
            href="https://github.com/sthakri"
            className="team-link"
            target="_blank"
            rel="noreferrer"
          >
            Profile
          </a>
        </div>
      </div>
    </section>
  );
}

export default Team;
