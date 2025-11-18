const { UserModel } = require("../../model/UserModel");
const baseLogger = require("../util/logger");
const { attachToken, SESSION_COOKIE } = require("../util/SecretToken");
const WalletService = require("../services/WalletService");

const DASHBOARD_HOME = process.env.DASHBOARD_URL || "http://localhost:3000";

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Optional: set to true for stricter security
};

function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }

  const trimmedEmail = email.trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true, email: trimmedEmail.toLowerCase() };
}

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    };
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  if (
    PASSWORD_REQUIREMENTS.requireSpecialChar &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { valid: true };
}

function validateFullName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { valid: false, message: "Full name is required" };
  }

  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) {
    return {
      valid: false,
      message: "Full name must be at least 2 characters long",
    };
  }

  if (trimmedName.length > 80) {
    return { valid: false, message: "Full name must not exceed 80 characters" };
  }

  return { valid: true, fullName: trimmedName };
}

// Helper function to return minimal user info (never include password)
function sanitizeUserResponse(user) {
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

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

  // Validate full name
  const nameValidation = validateFullName(fullName);
  if (!nameValidation.valid) {
    return res.status(400).json({
      success: false,
      message: nameValidation.message,
    });
  }

  // Validate and normalize email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.message,
    });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message,
    });
  }

  // Check if user already exists
  const existing = await UserModel.findOne({ email: emailValidation.email });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  // Create user (password will be hashed by pre-save hook with bcrypt salt rounds >= 10)
  const user = await UserModel.create({
    fullName: nameValidation.fullName,
    email: emailValidation.email,
    password,
  });

  // Initialize wallet with starting balance of $100,000
  try {
    await WalletService.getOrCreateWallet(user._id);
  } catch (walletError) {
    const logger = typeof req !== "undefined" && req.log ? req.log : baseLogger;
    logger.error(
      { err: walletError, userId: user._id.toString() },
      "Failed to create wallet for user"
    );
    // Wallet creation failed, but user was created - log error and continue
    // Wallet will be created automatically on first transaction if needed
  }

  // Attach JWT token to HTTP-only cookie
  attachToken(res, { id: user._id, role: user.role, email: user.email });

  // Log auth success
  const logger = typeof req !== "undefined" && req.log ? req.log : baseLogger;
  logger.info(
    { userId: user._id.toString(), email: user.email },
    "Signup successful"
  );

  // Return minimal user info (never password)
  return res.status(201).json({
    success: true,
    message: "Signup successful",
    user: sanitizeUserResponse(user),
    redirectUrl: `${DASHBOARD_HOME}/`,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.message,
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  // Find user by normalized email
  const user = await UserModel.findOne({ email: emailValidation.email });
  if (!user) {
    const logger = typeof req !== "undefined" && req.log ? req.log : baseLogger;
    logger.warn(
      { email: emailValidation.email },
      "Login failed: user not found"
    );
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Compare password using bcrypt (hashed comparison)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const logger = typeof req !== "undefined" && req.log ? req.log : baseLogger;
    logger.warn({ userId: user._id.toString() }, "Login failed: bad password");
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Attach JWT token to HTTP-only cookie
  attachToken(res, { id: user._id, role: user.role, email: user.email });

  // Log success
  const logger = typeof req !== "undefined" && req.log ? req.log : baseLogger;
  logger.info({ userId: user._id.toString() }, "Login successful");

  // Return minimal user info (never password)
  return res.json({
    success: true,
    message: "Login successful",
    user: sanitizeUserResponse(user),
    redirectUrl: `${DASHBOARD_HOME}/`,
  });
});

const logout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Clear cookie with same options used when setting it
  const clearOptions = {
    httpOnly: true,
    path: "/",
  };

  // Match production settings for proper cookie clearing
  if (isProduction) {
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (cookieDomain) {
      clearOptions.domain = cookieDomain;
    }
    clearOptions.secure = true;
    clearOptions.sameSite = "none";
  } else {
    clearOptions.secure = false;
    clearOptions.sameSite = "lax";
  }

  res.clearCookie(SESSION_COOKIE, clearOptions);

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

const profile = asyncHandler(async (req, res) => {
  // Return minimal user info (never password)
  return res.json({
    success: true,
    user: sanitizeUserResponse(req.user),
  });
});

module.exports = {
  register,
  login,
  logout,
  profile,
};
