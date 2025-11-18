import React from "react";

function Community() {
  return (
    <section className="container py-5">
      <div className="community-wrap p-5">
        <div className="text-center mb-5">
          <span className="community-pill mb-3">Community</span>
          <h2 className="section-heading mb-3">
            You’re Not Just Trading — You’re Growing With Us
          </h2>
          <p className="section-subtitle mx-auto">
            EquiNova isn’t just a platform — it’s a space for learners,
            hobbyists, and data enthusiasts who want to understand markets the
            right way. We share insights, compare strategies, and celebrate
            every small win — together.
          </p>
        </div>
        <div
          className="community-body text-center text-md-start mx-auto"
          style={{ maxWidth: "720px" }}
        >
          {/* <p className="mb-4">
            Weekly strategy jams, open curriculum notes, and build-in-public
            sessions keep the rhythm going. Whether you’re debugging a script or
            journaling your first paper trade, there’s always someone ready to
            compare notes and cheer you on.
          </p>
          <p className="mb-0 fw-semibold text-muted">
            Join the Discord, hop into a cohort, or just read along — the door
            stays open.
          </p> */}
        </div>
      </div>
    </section>
  );
}

export default Community;
