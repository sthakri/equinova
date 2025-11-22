import React from "react";

import Hero from "./Hero";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import OpenAccount from "../OpenAccount";

function ProductPage() {
  return (
    <>
      <Hero />
      <LeftSection
        imageURL="https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Dashboard (Implemented)"
        productDesription="Shows simulated symbol prices updating every few seconds and provides access to paper trade actions. Focus: clarity and core mechanics—not real-time exchange data or advanced layout widgets yet."
        googlePlay=""
        appStore=""
      />
      <RightSection
        imageURL="https://images.pexels.com/photos/7567445/pexels-photo-7567445.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Portfolio Overview (Implemented)"
        productDesription="Displays current simulated holdings, wallet balance impact, and basic transaction records. Detailed performance charts / allocation visualizations are planned but not yet built."
      />
      <LeftSection
        imageURL="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80"
        productName="Order Management (Implemented)"
        productDesription="Submit paper BUY/SELL orders that adjust virtual wallet balance and appear in transaction history. No advanced order types (conditional, bracket) or automation yet—single action tickets only."
        googlePlay=""
        appStore=""
      />
      <RightSection
        imageURL="https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Analytics & Charts (Planned)"
        productDesription="Not implemented. Future exploration: historical price views, multi-interval charts, annotation tools, and comparative symbol panels. Currently omitted to keep foundation stable first."
      />
      <LeftSection
        imageURL="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Data Integrations (Planned)"
        productDesription="External market APIs (e.g., real-time providers) are not connected. Current pricing uses an internal random-walk simulator. Future integration hooks will be evaluated after core feature hardening."
        googlePlay=""
        appStore=""
      />
      <br /> <br /> <br /> <br />
      <section className="container border-bottom mb-5">
        <p className="text-muted small mb-0">
          Summary: Implemented modules limited to dashboard price simulation,
          portfolio overview basics, and single-ticket order management.
          Analytics, integrations, and advanced automation are conceptual only
          at this stage.
        </p>
      </section>
      <OpenAccount></OpenAccount>
    </>
  );
}

export default ProductPage;
