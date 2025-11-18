import React from "react";
import Hero from "./Hero";
import Pricing from "./Pricing";
import Education from "./Education";
import Stats from "./Stats";
import OpenAccount from "../OpenAccount";

function HomePage() {
  return (
    <main>
      <Hero />
      <div className="gradient-divider" aria-hidden="true"></div>
      <Stats />
      <div className="gradient-divider" aria-hidden="true"></div>
      <Pricing />
      <div className="gradient-divider" aria-hidden="true"></div>
      <Education />
      <div className="gradient-divider" aria-hidden="true"></div>
      <OpenAccount />
    </main>
  );
}

export default HomePage;
