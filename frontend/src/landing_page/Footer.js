import React from "react";

function Footer() {
  return (
    <footer className="equinova-footer py-5 mt-5">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-md-6">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
              <span className="footer-logo">EquiNova</span>
              <p className="footer-tagline mb-0">
                Practice trading. Build confidence. Grow smarter.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-md-end justify-content-start align-items-center gap-3">
              <a
                href="https://www.linkedin.com"
                className="footer-icon"
                aria-label="EquiNova on LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a
                href="https://github.com"
                className="footer-icon"
                aria-label="EquiNova on GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-brands fa-github"></i>
              </a>
              <a
                href="https://www.instagram.com"
                className="footer-icon"
                aria-label="EquiNova on Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://www.facebook.com"
                className="footer-icon"
                aria-label="EquiNova on Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div>
            <p className="footer-copy mb-0 text-md-end mt-3">
              © 2025 EquiNova. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
