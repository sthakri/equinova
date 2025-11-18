import React from "react";

function reportError(error, errorInfo) {
  try {
    if (
      typeof window !== "undefined" &&
      window.__ERROR_TRACKER__?.captureException
    ) {
      window.__ERROR_TRACKER__.captureException(error, { extra: errorInfo });
    } else if (typeof console !== "undefined" && console.error) {
      // Fallback to console logging
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  } catch (_) {
    // Swallow any secondary errors in error reporting
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, errorInfo);
  }

  handleRetry = () => {
    // Allow retry without full reload if a reset prop is provided
    if (typeof this.props.onReset === "function") {
      try {
        this.props.onReset();
        this.setState({ hasError: false, error: null });
        return;
      } catch (e) {
        // If reset fails, fall back to reload
      }
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#fafafa",
            color: "#333",
            fontFamily:
              "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ maxWidth: 560, textAlign: "center" }}>
            <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ margin: 0, opacity: 0.8 }}>
              An unexpected error occurred while rendering this page. Please try
              again.
            </p>
            <div style={{ marginTop: 20 }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
            </div>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <pre
                style={{
                  marginTop: 16,
                  textAlign: "left",
                  background: "#fff",
                  padding: 12,
                  borderRadius: 6,
                  overflowX: "auto",
                  border: "1px solid #eee",
                }}
              >
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
