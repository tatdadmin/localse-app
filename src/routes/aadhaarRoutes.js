const express = require("express");
const router = express.Router();
const { sendAadhaarOTP,verifyAadhaarOTP } = require("../controllers/aadhaarVerificationController");

router.post("/send_aadhaar_otp-api", sendAadhaarOTP);
router.post("/verify-aadhaar-api", verifyAadhaarOTP);

module.exports = router;
