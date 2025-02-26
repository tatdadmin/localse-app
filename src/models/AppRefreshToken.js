const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  mobile_number: {
    type: String,
    required: true,
    // unique: true,
    match: /^[0-9]{10}$/,
  },
  token: {
    type: String,
    required: true,
  },
  fcm_token: {
    type: String,
    default: "",
  },
  deviceOS: {
    type: String,
    default: "",
  },
  expires_at: {
    type: Date,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    // default: "Service Provider",
  },
  app_version: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    // default: Date.now,
  },
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema,"app_refresh_token");
module.exports = RefreshToken;
