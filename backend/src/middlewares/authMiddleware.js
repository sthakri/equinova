const { UserModel } = require("../../model/UserModel");
const { verifyToken, SESSION_COOKIE } = require("../util/SecretToken");

async function authenticationGuard(req, res, next) {
  try {
    // Extract token from cookie or Authorization header
    let token = req.cookies?.[SESSION_COOKIE];

    // If no cookie, check Authorization header
    if (!token && req.headers?.authorization) {
      const authHeader = req.headers.authorization;
      // Handle "Bearer <token>" or just "<token>"
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      req.log?.warn(
        {
          path: req.path,
          hasCookies: !!req.cookies,
          cookieNames: req.cookies ? Object.keys(req.cookies) : [],
          hasAuthHeader: !!req.headers?.authorization,
          authHeaderValue: req.headers?.authorization ? "present" : "missing",
        },
        "Authentication required - no token"
      );
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.id);

    if (!user) {
      req.log?.warn(
        { path: req.path, userId: payload.id },
        "Authentication failed - user not found"
      );
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    req.log?.info(
      { userId: user._id.toString(), path: req.path },
      "Auth successful"
    );
    return next();
  } catch (error) {
    req.log?.warn(
      { err: error.message, path: req.path },
      "Authentication error"
    );
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = { authenticationGuard };
