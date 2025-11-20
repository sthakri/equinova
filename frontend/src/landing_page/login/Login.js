import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";

const reassurance = [
  "Biometric-ready sessions",
  "Secure device approvals",
  "Live session status",
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
    // Placeholder for forgot password functionality
    alert(
      "Forgot Password feature coming soon! Please contact support for password reset assistance."
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
        const dashboardUrl = `${redirectUrl}?token=${encodeURIComponent(token)}`;
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
                <span>Welcome back</span>
                <h2>Log in to EquiNova</h2>
                <p>Pick up where you left off in your trading sprint.</p>
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
            <span className="data-pill auth-badge">Secure cloud trading</span>
            <h1 className="display-5 fw-semibold mt-3 mb-4">
              Continue your guided practice with real-time market sync.
            </h1>
            <p className="lead text-muted mb-4">
              EquiNova remembers your open simulations, portfolio notes, and
              coaching cues so you can resume every sprint without context
              switching.
            </p>
            <div className="auth-activity-feed">
              <div className="auth-activity-card">
                <span className="hero-chip">Session status</span>
                <strong>Macro Momentum</strong>
                <p className="mb-0">Paused · 12m ago · Risk score 24</p>
              </div>
              <div className="auth-activity-card">
                <span className="hero-chip hero-chip-success">Watchlist</span>
                <strong>Energy rotation</strong>
                <p className="mb-0">3 opportunities flagged overnight</p>
              </div>
            </div>
            <ul className="auth-checklist mt-4">
              {reassurance.map((item) => (
                <li key={item}>
                  <span className="auth-check-icon" aria-hidden="true">
                    ✔
                  </span>
                  <div>
                    <strong>{item}</strong>
                    <p className="mb-0 text-muted">
                      Part of the EquiNova secure sign-in flow
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
