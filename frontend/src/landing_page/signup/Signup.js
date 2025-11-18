import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";

const growthHighlights = [
  {
    title: "Free practice portfolio",
    detail: "Start with $25,000 virtual cash to explore advanced order types.",
  },
  {
    title: "Adaptive lessons",
    detail: "Progressive curriculum that unlocks new modules as you grow.",
  },
  {
    title: "Session replays",
    detail: "Review every trade with annotated charts and coaching cues.",
  },
];

const DASHBOARD_REDIRECT =
  process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation requirements
const PASSWORD_MIN_LENGTH = 8;

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
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

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    // Validate email format
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate username (fullName)
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) {
      errors.username = "Full name is required";
    } else if (trimmedUsername.length < 2) {
      errors.username = "Full name must be at least 2 characters long";
    } else if (trimmedUsername.length > 80) {
      errors.username = "Full name must not exceed 80 characters";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/\d/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
      const response = await apiClient.post("/api/auth/signup", {
        fullName: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(response.data?.message || "Signup successful! Redirecting...");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = response.data?.redirectUrl || DASHBOARD_REDIRECT;
      }, 800);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Please try again.";
      console.error("Signup failed", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="data-pill auth-badge">
              Guided onboarding · 3 steps
            </span>
            <h1 className="display-5 fw-semibold mt-3 mb-4">
              Create your EquiNova workspace.
            </h1>
            <p className="lead text-muted mb-4">
              Build a resilient trading routine with curated simulations,
              collaborative notes, and advanced watchlists designed for modern
              retail investors.
            </p>
            <div className="row g-3">
              <div className="col-6">
                <div className="auth-metric-card">
                  <small>Avg. practice ROI</small>
                  <strong>+5.2%</strong>
                  <span>after 6 guided sessions</span>
                </div>
              </div>
              <div className="col-6">
                <div className="auth-metric-card">
                  <small>Community</small>
                  <strong>14k+</strong>
                  <span>peer strategists</span>
                </div>
              </div>
            </div>
            <ul className="auth-checklist mt-4">
              {growthHighlights.map((item) => (
                <li key={item.title}>
                  <span className="auth-check-icon" aria-hidden="true">
                    ✔
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="mb-0 text-muted">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-5 ms-lg-auto">
            <div className="auth-card">
              <div className="auth-card-header">
                <span>Step 1</span>
                <h2>Create your account</h2>
                <p>We will keep your details safe and private.</p>
              </div>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.email ? "error" : ""}
                />
                {validationErrors.email && (
                  <span className="field-error">{validationErrors.email}</span>
                )}

                <label htmlFor="username">Full name</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Jordan Lee"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.username ? "error" : ""}
                />
                {validationErrors.username && (
                  <span className="field-error">
                    {validationErrors.username}
                  </span>
                )}

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.password ? "error" : ""}
                />
                {validationErrors.password && (
                  <span className="field-error">
                    {validationErrors.password}
                  </span>
                )}

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={validationErrors.confirmPassword ? "error" : ""}
                />
                {validationErrors.confirmPassword && (
                  <span className="field-error">
                    {validationErrors.confirmPassword}
                  </span>
                )}
                <small className="text-muted">
                  Must contain uppercase, lowercase, and number
                </small>

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
                  {isSubmitting ? "Creating account..." : "Create free account"}
                </button>
              </form>
              <p className="auth-switch">
                Already onboarded? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
