import React from "react";

function CreateTicket() {
  return (
    <div className="container">
      <div className="row">
        <h3 className="text-muted fs-2">
          To create a ticket, select a relevant topic
        </h3>
        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-solid fa-circle-plus"></i> Account Setup
          </h4>
          <a
            href="/support/account-setup/platform-overview"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Platform overview
          </a>
          <br />
          <a
            href="/support/account-setup/workspace"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Create your workspace
          </a>
          <br />
          <a
            href="/support/account-setup/broker-connections"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Connect your broker
          </a>
          <br />
          <a
            href="/support/account-setup/plans"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Plans and billing
          </a>
          <br />
          <a
            href="/support/account-setup/business"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Business & team accounts
          </a>
          <br />
          <a
            href="/support/account-setup/international"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            International users
          </a>
          <br />
        </div>
        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-regular fa-user"></i> Your EquiNova Account
          </h4>
          <a
            href="/support/account/login-security"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Login & security
          </a>
          <br />
          <a
            href="/support/account/profile-preferences"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Profile preferences
          </a>
          <br />
          <a
            href="/support/account/workspace-roles"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Workspace roles & access
          </a>
          <br />
          <a
            href="/support/account/two-factor"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Two-factor authentication
          </a>
          <br />
          <a
            href="/support/account/notifications"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Notifications
          </a>
          <br />
          <a
            href="/support/account/mentor-access"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Mentor & coach access
          </a>
          <br />
        </div>
        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-solid fa-chart-simple"></i> Trading & Markets
          </h4>
          <a
            href="/support/trading/faqs"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Trading FAQs
          </a>
          <br />
          <a
            href="/support/trading/order-types"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Simulated order types
          </a>
          <br />
          <a
            href="/support/trading/margins"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Margin requirements
          </a>
          <br />
          <a
            href="/support/trading/market-data"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Live market data feeds
          </a>
          <br />
          <a
            href="/support/trading/corporate-events"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Corporate events in sim
          </a>
          <br />
          <a
            href="/support/trading/strategy-templates"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Strategy templates
          </a>
          <br />
        </div>

        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-solid fa-window-maximize"></i> Portfolio & Funds
          </h4>
          <a
            href="/support/funding/virtual-cash"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Virtual cash management
          </a>
          <br />
          <a
            href="/support/funding/portfolio-sync"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Linking real portfolios
          </a>
          <br />
          <a
            href="/support/funding/broker-sync"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Broker sync status
          </a>
          <br />
          <a
            href="/support/funding/faqs"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Funding FAQs
          </a>
          <br />
        </div>
        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-solid fa-terminal"></i> Analytics Dashboard
          </h4>
          <a
            href="/support/analytics/performance-reports"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Performance reports
          </a>
          <br />
          <a
            href="/support/analytics/journaling"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Journaling tools
          </a>
          <br />
          <a
            href="/support/analytics/export"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Export & share data
          </a>
          <br />
          <a
            href="/support/analytics/risk"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Risk analytics
          </a>
          <br />
          <a
            href="/support/analytics/progress"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Progress tracking
          </a>
          <br />
          <a
            href="/support/analytics/coach-feedback"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Coach feedback
          </a>
          <br />
        </div>
        <div className="col-4 pt-5 mt-2 mb-2">
          <h4>
            <i className="fa-solid fa-book-open"></i> Learning Hub
          </h4>
          <a
            href="/support/learning/curriculum"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Curriculum overview
          </a>
          <br />
          <a
            href="/support/learning/video-library"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Video library
          </a>
          <br />
          <a
            href="/support/learning/workshops"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Live workshops
          </a>
          <br />
          <a
            href="/support/learning/certification"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Certification tracks
          </a>
          <br />
          <a
            href="/support/learning/community"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Community discussions
          </a>
          <br />
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
