const { UserModel } = require("../../model/UserModel");
const { verifyToken, SESSION_COOKIE } = require("../util/SecretToken");

async function authenticationGuard(req, res, next) {
  try {
    // Log incoming request details
    console.log("[AuthMiddleware] Incoming request:", {
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      hasCookies: !!req.cookies,
      cookieNames: req.cookies ? Object.keys(req.cookies) : [],
      hasAuthHeader: !!req.headers?.authorization,
      authHeaderPreview: req.headers?.authorization ? 
        req.headers.authorization.substring(0, 30) + "..." : "NONE"
    });

    // Extract token from cookie or Authorization header
    let token = req.cookies?.[SESSION_COOKIE];

    // If no cookie, check Authorization header
    if (!token && req.headers?.authorization) {
      const authHeader = req.headers.authorization;
      // Handle "Bearer <token>" or just "<token>"
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log("[AuthMiddleware] Extracted Bearer token:", token.substring(0, 20) + "...");
      } else {
        token = authHeader;
        console.log("[AuthMiddleware] Using raw auth header as token");
      }
    } else if (token) {
      console.log("[AuthMiddleware] Using cookie token:", token.substring(0, 20) + "...");
    }

    if (!token) {
      console.warn("[AuthMiddleware] NO TOKEN FOUND");
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

    console.log("[AuthMiddleware] Verifying token...");
    const payload = verifyToken(token);
    console.log("[AuthMiddleware] Token verified, user ID:", payload.id);
    
    const user = await UserModel.findById(payload.id);

    if (!user) {
      console.warn("[AuthMiddleware] User not found in database:", payload.id);
      req.log?.warn(
        { path: req.path, userId: payload.id },
        "Authentication failed - user not found"
      );
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    console.log("[AuthMiddleware] Authentication successful for user:", user._id.toString());
    req.log?.info(
      { userId: user._id.toString(), path: req.path },
      "Auth successful"
    );
    return next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error.message);
    req.log?.warn(
      { err: error.message, path: req.path },
      "Authentication error"
    );
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = { authenticationGuard };
