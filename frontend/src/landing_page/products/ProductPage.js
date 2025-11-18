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
        productName="Real-Time Dashboard"
        productDesription="A unified workspace that blends your watchlist, streaming price updates, and quick trade actions. Designed so learners can monitor market moves and react with confidence during every practice session."
        tryDemo="/demo/dashboard"
        learnMore="/product/dashboard"
        googlePlay=""
        appStore=""
      />
      <RightSection
        imageURL="https://images.pexels.com/photos/7567445/pexels-photo-7567445.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Portfolio Overview"
        productDesription="Track simulated holdings, P&L, and allocation trends in one clear view. Interactive performance charts highlight what’s working and where to adjust before you take a real position."
        learnMore="/product/portfolio"
      />
      <LeftSection
        imageURL="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80"
        productName="Order Management"
        productDesription="Place paper buy and sell orders with an intuitive ticket, manage open positions, and review execution history. Every workflow mirrors a live desk so you can build habits without risking capital."
        tryDemo="/demo/orders"
        learnMore="/product/orders"
        googlePlay=""
        appStore=""
      />
      <RightSection
        imageURL="https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Analytics & Charts"
        productDesription="Layer interactive charts, custom timeframes, and side-by-side comparisons to test ideas quickly. Insightful annotations help you document what you learned from each simulated move."
        learnMore="/product/analytics"
      />
      <LeftSection
        imageURL="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200"
        productName="Data Integrations"
        productDesription="EquiNova taps public market APIs like Twelve Data and Finnhub for live pricing today, with hooks ready for additional feeds tomorrow. Plug in new datasets as you grow your playbook."
        tryDemo=""
        learnMore="/product/integrations"
        googlePlay=""
        appStore=""
      />
      <br></br> <br></br> <br></br> <br></br>
      <section className="container border-bottom mb-5"></section>
      <OpenAccount></OpenAccount>
    </>
  );
}

export default ProductPage;
