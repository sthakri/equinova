import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5" id="supportWrapper">
        <a href="/support" style={{ color: "white", textDecoration: "none" }}>
          <h4>Support Portal</h4>
        </a>
        <a href="/support/tickets">Track tickets</a>
      </div>

      <div className="row p-3 mb-5">
        <div className="col-8 p-5">
          <h1 className="fs-3">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input
            placeholder='Try "How do I build my first strategy?"'
            aria-label="Search support articles"
          />
          <br />
          <a href="/support/account-setup/platform-overview" className="p-3">
            Check onboarding status{" "}
          </a>
          <a href="/support/account/pro-labs" className="p-3">
            Activate Pro Labs{" "}
          </a>
          <a href="/support/trading/margins" className="p-3">
            Sim margin guide{" "}
          </a>
          <br />
          <a href="/support/learning/playbook" className="p-3">
            EquiNova playbook
          </a>
        </div>
        <div className="col-4">
          <h1 className="fs-3">Featured</h1>
          <ol>
            <li>
              <a href="/support/updates/q4-roadmap">
                EquiNova roadmap — Q4 2024
              </a>
            </li>
            <li>
              <a href="/support/updates/data-release">
                Live market data release notes
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
