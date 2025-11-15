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

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds * 1000,
  });

  return token;
}

module.exports = {
  SESSION_COOKIE,
  signToken,
  verifyToken,
  attachToken,
};
