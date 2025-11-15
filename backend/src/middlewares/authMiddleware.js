const { UserModel } = require("../../model/UserModel");
const { verifyToken, SESSION_COOKIE } = require("../util/SecretToken");

async function authenticationGuard(req, res, next) {
  try {
    const token =
      req.cookies?.[SESSION_COOKIE] ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = { authenticationGuard };
