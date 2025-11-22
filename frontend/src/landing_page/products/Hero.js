import React from "react";

function Hero() {
  return (
    <section className="container border-bottom mb-5">
      <div className="text-center mt-5 p-4 p-lg-5">
        <span className="community-pill mb-3">Product</span>
        <h1 className="section-heading mb-3">Foundation for paper trading.</h1>
        <p className="section-subtitle mx-auto">
          The current product covers a simulated price feed, a virtual wallet
          with starting balance, basic BUY/SELL order recording, and holdings &
          transaction tracking. Advanced analytics, external data integrations,
          and rich charting are not implemented yet and are treated as future
          explorations.
        </p>
      </div>
    </section>
  );
}

export default Hero;
