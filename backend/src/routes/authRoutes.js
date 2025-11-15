const express = require("express");
const {
  register,
  login,
  logout,
  profile,
} = require("../controllers/AuthController");
const { authenticationGuard } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticationGuard, profile);

module.exports = router;
