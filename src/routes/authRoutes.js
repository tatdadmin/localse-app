const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");

router.post("/login/login-otp", authController.sendOtp);
router.post("/login/verify-otp-login", authController.verifyOtp);
router.post("/login/save-fcn-token-api", authController.createFcnToken)
router.post("/login/refresh_token", authController.renewAccessToken)

router.get('/protected', authenticate, (req, res) => {
    res.json({ success: true, message: "Access granted", user: req.user });
  });

module.exports = router;
