const { UserModel } = require("../../model/UserModel");
const { attachToken, SESSION_COOKIE } = require("../util/SecretToken");

const DASHBOARD_HOME = process.env.DASHBOARD_URL || "http://localhost:3000";

function formatMongoError(error) {
  if (error?.code === 11000) {
    return "An account with this email already exists.";
  }
  return error?.message || "Unable to process request.";
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Full name, email, and password are required",
    });
  }

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({
      message: "An account with this email already exists",
    });
  }

  const user = await UserModel.create({ fullName, email, password });

  attachToken(res, { id: user._id, role: user.role, email: user.email });

  return res.status(201).json({
    message: "Signup successful",
    user,
    redirectUrl: `${DASHBOARD_HOME}/`,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message:
        "We couldn't find an account with that email. Please sign up first.",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "The password you entered is incorrect. Please try again.",
    });
  }

  attachToken(res, { id: user._id, role: user.role, email: user.email });

  return res.json({
    message: "Login successful",
    user,
    redirectUrl: `${DASHBOARD_HOME}/`,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ message: "Logged out successfully" });
});

const profile = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = {
  register,
  login,
  logout,
  profile,
};
