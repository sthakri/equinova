const jwt = require("jsonwebtoken");

const SESSION_COOKIE = "equinova_session";
const DEFAULT_EXPIRY = "3d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: options.expiresIn || DEFAULT_EXPIRY,
  });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

function attachToken(res, payload, options = {}) {
  const token = signToken(payload, options);
  const maxAgeSeconds = options.maxAgeSeconds || 3 * 24 * 60 * 60;
  const isProduction = process.env.NODE_ENV === "production";

  // Cookie configuration for cross-origin/subdomain support
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript access (XSS protection)
    maxAge: maxAgeSeconds * 1000,
    path: "/", // Cookie available for all paths
  };

  // Production settings for cross-subdomain cookie sharing
  if (isProduction) {
    // For production with subdomains (e.g., app.yourdomain.com, dashboard.yourdomain.com)
    const cookieDomain = process.env.COOKIE_DOMAIN; // Should be ".yourdomain.com" (with leading dot)

    if (cookieDomain) {
      cookieOptions.domain = cookieDomain; // Leading dot allows subdomain sharing
      const logger = require("./logger");
      logger.info({ cookieDomain }, "Cookie domain configured");
    }

    cookieOptions.secure = true; // Require HTTPS in production
    cookieOptions.sameSite = "none"; // Required for cross-site cookies with secure flag

    // CRITICAL: Add Partitioned attribute for CHIPS (Cookies Having Independent Partitioned State)
    // This allows cookies to work in third-party contexts in modern browsers (Chrome 118+)
    // Express res.cookie() doesn't support Partitioned yet, so we set it manually
    const cookieValue = `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAgeSeconds}; Partitioned`;
    res.setHeader("Set-Cookie", cookieValue);

    const logger = require("./logger");
    logger.info(
      { partitioned: true, sameSite: "none" },
      "Production cookie with Partitioned attribute set"
    );

    return token;
  } else {
    // Development settings (localhost)
    cookieOptions.secure = false; // Allow HTTP in development
    cookieOptions.sameSite = "lax"; // More permissive for local development
  }

  res.cookie(SESSION_COOKIE, token, cookieOptions);

  return token;
}

module.exports = {
  SESSION_COOKIE,
  signToken,
  verifyToken,
  attachToken,
};
