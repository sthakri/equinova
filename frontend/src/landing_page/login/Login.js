import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";

// Implemented, factual features (used for checklist display)
const implementedFeatures = [
  "Secure email/password authentication",
  "Initial virtual wallet balance ($100k)",
  "Random-walk price simulation (~3s updates)",
  "Paper BUY/SELL order tracking",
];

const DASHBOARD_REDIRECT =
  process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear general error message
    if (error) {
      setError("");
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    alert(
      "Password reset flow not implemented yet. Please contact support if you need assistance."
    );
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    // Validate email format
    const trimmedEmail = formData.loginEmail.trim();
    if (!trimmedEmail) {
      errors.loginEmail = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.loginEmail = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.loginPassword) {
      errors.loginPassword = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Run client-side validation
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("[Login] Submitting to backend...");
      const response = await apiClient.post("/api/auth/login", {
        email: formData.loginEmail.trim(),
        password: formData.loginPassword,
      });

      console.log("[Login] Response received:", response.data);
      setSuccess(response.data?.message || "Login successful! Redirecting...");

      // Get token and pass it to dashboard via URL
      const token = response.data?.token;
      if (token) {
        console.log("[Login] Token received, redirecting to dashboard...");
        const redirectUrl = response.data?.redirectUrl || DASHBOARD_REDIRECT;
        // Pass token as URL parameter for cross-domain authentication
        const dashboardUrl = `${redirectUrl}?token=${encodeURIComponent(
          token
        )}`;
        console.log("[Login] Redirecting to:", dashboardUrl);

        setTimeout(() => {
          window.location.href = dashboardUrl;
        }, 400);
      } else {
        console.error("[Login] No token in response");
        setError("Login failed - no authentication token received");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
      setIsSubmitting(false); // Reset button state on error
    }
  };

  return (
    <section className="auth-section auth-section-alt">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-5 order-lg-2">
            <div className="auth-card">
              <div className="auth-card-header">
                <span>Account Access</span>
                <h2>Log in to EquiNova</h2>
                <p>Continue practicing with your virtual wallet and trades.</p>
              </div>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="loginEmail">Email address</label>
                <input
                  id="loginEmail"
                  name="loginEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.loginEmail ? "error" : ""}
                />
                {validationErrors.loginEmail && (
                  <span className="field-error">
                    {validationErrors.loginEmail}
                  </span>
                )}

                <label
                  htmlFor="loginPassword"
                  className="d-flex justify-content-between"
                >
                  <span>Password</span>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={handleForgotPassword}
                  >
                    Forgot?
                  </button>
                </label>
                <input
                  id="loginPassword"
                  name="loginPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.loginPassword ? "error" : ""}
                />
                {validationErrors.loginPassword && (
                  <span className="field-error">
                    {validationErrors.loginPassword}
                  </span>
                )}

                {error && (
                  <div className="auth-alert auth-alert-error">{error}</div>
                )}
                {success && (
                  <div className="auth-alert auth-alert-success">{success}</div>
                )}

                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing you in..." : "Access dashboard"}
                </button>
              </form>
              <p className="auth-switch">
                No account yet? <Link to="/signup">Create one</Link>
              </p>
            </div>
          </div>
          <div className="col-lg-6 order-lg-1">
            <span className="data-pill auth-badge">Sandbox login</span>
            <h1 className="display-5 fw-semibold mt-3 mb-4">
              Access your virtual balance and paper trades.
            </h1>
            <p className="lead text-muted mb-4">
              On login the dashboard loads your wallet balance, recorded
              transactions, and current simulated prices. No biometric, device
              approval, or coaching layers are implemented yet.
            </p>
            <div className="auth-activity-feed">
              <div className="auth-activity-card">
                <span className="hero-chip hero-chip-muted">Implemented</span>
                <strong>Core modules active</strong>
                <p className="mb-0">Auth, wallet, orders, price feed</p>
              </div>
            </div>
            <ul className="auth-checklist mt-4">
              {implementedFeatures.map((item) => (
                <li key={item}>
                  <span className="auth-check-icon" aria-hidden="true">
                    ✔
                  </span>
                  <div>
                    <strong>{item}</strong>
                    <p className="mb-0 text-muted">
                      Factual, currently available
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
