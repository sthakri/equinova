const { UserModel } = require("../../model/UserModel");
const { verifyToken, SESSION_COOKIE } = require("../util/SecretToken");

async function authenticationGuard(req, res, next) {
  try {
    const token =
      req.cookies?.[SESSION_COOKIE] ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      req.log?.warn(
        { 
          path: req.path, 
          hasCookies: !!req.cookies,
          cookieNames: req.cookies ? Object.keys(req.cookies) : [],
          hasAuthHeader: !!req.headers?.authorization 
        }, 
        "Authentication required - no token"
      );
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.id);

    if (!user) {
      req.log?.warn(
        { path: req.path },
        "Authentication failed - user not found"
      );
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    return next();
  } catch (error) {
    req.log?.warn({ err: error, path: req.path }, "Authentication error");
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = { authenticationGuard };
