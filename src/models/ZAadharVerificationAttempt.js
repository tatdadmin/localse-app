const mongoose = require("mongoose");

const ZAadhaarVerificationAttemptSchema = new mongoose.Schema({
  mobile_number: { type: String, required: true },
  aadhaar_number: { type: String, required: true },
  start_date: { type: String, required: true }, // Stored as a formatted string
  end_date: { type: String, required: true },   // Stored as a formatted string
});

module.exports = mongoose.model("ZAadhaarVerificationAttempt", ZAadhaarVerificationAttemptSchema,"z_aadhar_verification_attempts");
