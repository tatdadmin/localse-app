const mongoose = require("mongoose");

const appLoginAttemptSchema = new mongoose.Schema({
  mobile: { type: String, required: true, length: 10 },
  otp: { type: String, required: false, length: 4 }, 
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  login_status: { type: Number, default: 0 },
  IpAddress: { type: String, required: true },
  user_type: { type: String,
    //  default: "Service Provider"
     },
  db_user: { type: String,
    //  default: "Service Provider"
     },
  deviceOS: { type: String, required: true },
  app_version: { type: String, required: true }
});

module.exports = mongoose.model("AppLoginAttempt", appLoginAttemptSchema,"app_login_attempt");
