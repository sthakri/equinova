import React from "react";

function Team() {
  return (
    <section className="container py-5">
      <div className="text-center mb-4">
        <span className="community-pill mb-3">Team</span>
        <h2 className="section-heading mb-2">Built by curious minds.</h2>
        <p className="section-subtitle mx-auto">
          EquiNova is crafted by a small builder who believes thoughtful tools
          make learning markets less intimidating and more rewarding.
        </p>
      </div>
      <div className="team-card mx-auto text-center p-4 p-lg-5">
        <div className="team-avatar mx-auto mb-4">KS</div>
        <h3 className="h5 mb-1">Kritagya Shrestha</h3>
        <p className="text-muted small mb-3">Founder & Developer</p>
        <p className="text-muted mb-3" style={{ lineHeight: "1.8" }}>
          EquiNova began as a personal project to turn market curiosity into a
          daily practice space. It now helps classmates, friends, and new
          traders experiment safely with live data while building real
          confidence.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a
            href="https://github.com/"
            className="team-link"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/"
            className="team-link"
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
        </div>
      </div>
    </section>
  );
}

export default Team;
