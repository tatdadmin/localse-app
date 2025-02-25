// Import other necessary modules
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Removed duplicate import — Only keep this function
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

/**
 * Generate Refresh Token (valid for 1 month)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "30d" });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const AppLoginAttempt = require("../models/AppLoginAttempt");
const Login = require("../models/Login");
const RefreshToken = require("../models/AppRefreshToken");
const ServiceProviderModel = require("../models/serviceProviderModel");
const { sendSms } = require("../utils/sendSms");

// Send OTP function
exports.sendOtp = async ({ mobile, IpAddress, deviceOS, app_version }) => {
  try {
    const existingLogin = await AppLoginAttempt.findOne({ mobile
      , user_type:"Service Provider"
     });

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    let newLoginAttempt;

    if (existingLogin) {
      existingLogin.otp = otp;
      existingLogin.expires_at = expiresAt;
      existingLogin.IpAddress = IpAddress;
      existingLogin.deviceOS = deviceOS;
      existingLogin.app_version = app_version;
      existingLogin.login_status = 0;
      await existingLogin.save();
      newLoginAttempt = existingLogin;
    } else {
      newLoginAttempt = new AppLoginAttempt({
        mobile,
        otp,
        expires_at: expiresAt,
        IpAddress,
        deviceOS,
        app_version,
        login_status: 0,
        created_at: new Date(),
        user_type:"Service Provider",
        db_user:"Service Provider"
      });
      await newLoginAttempt.save();
    }
    const smsResponse = await sendSms(mobile, otp);

    if (!smsResponse.success) {
      return {
        success: false,
        status_code: 500,
        message: "SMS sending failed",
        error: smsResponse.error,
      };
    }
    
    return {
      success: true,
      status_code: 200,
      message: "OTP sent successfully",
      otp, // For testing, remove in production
    };
  } catch (error) {
    return {
      success: false,
      status_code: 500,
      message: "Error in OTP generation",
      error: error.message,
    };
  }
};

// Function to verify OTP
exports.verifyOtp = async ({ mobile, otp }) => {
  try {
    const loginAttempt = await AppLoginAttempt.findOne({ mobile
      , user_type:"Service Provider"
     });
    let fetchDeviceOs = loginAttempt.deviceOS;
    let fetchDeviceVersion = loginAttempt.app_version;
    if (!loginAttempt) {
      return {
        success: false,
        status: 404,
        message: "Mobile number not found",
      };
    }

    if (loginAttempt.otp !== otp) {
      return { success: false, status_code: 400, message: "Invalid OTP" };
    }

    if (new Date() > loginAttempt.expires_at) {
      return { success: false, status_code: 200, message: "OTP expired" };
    }

    // Mark OTP as used
    loginAttempt.login_status = 1;
    loginAttempt.otp = otp; // Clear OTP after verification
    await loginAttempt.save();

    // Fetch latest login attempt from `Login` table
    let user = await Login.findOne({
      mobile_number: mobile,
      page_url: "Service Provider Login",
    }).sort({ _id: -1 });

    if (!user) {
      // Insert new login record
      user = new Login({
        mobile_number: mobile,
        page_url: "Service Provider Login",
        login_time: new Date(),
      });

      await user.save();
    }

    // Generate JWT token
    const jwt = generateAccessToken({ mobile: user.mobile_number });

    // Generate Refresh Token
    const refreshToken = generateRefreshToken({ mobile: user.mobile_number });
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // Valid for 30 days

    // User type (default: Service Provider)
    const user_type = "Service Provider";

    // Handle app version defaults
    if (!fetchDeviceVersion) {
      fetchDeviceVersion =
        fetchDeviceOs === "Android"
          ? "1.0"
          : fetchDeviceOs === "iOS"
          ? "1.0"
          : "1.0";
    }

    // Check if refresh token already exists
    let existingToken = await RefreshToken.findOne({
      mobile_number: mobile,
      user_type,
    });

    if (existingToken) {
      // Update existing token
      existingToken.token = refreshToken;
      existingToken.expires_at = refreshTokenExpiry;
      existingToken.app_version = fetchDeviceVersion;
      existingToken.deviceOS = fetchDeviceOs;
      await existingToken.save();
    } else {
      // Insert new refresh token entry
      const newRefreshToken = new RefreshToken({
        mobile_number: mobile,
        token: refreshToken,
        expires_at: refreshTokenExpiry,
        user_type,
        app_version: fetchDeviceVersion,
        deviceOS: fetchDeviceOs,
      });

      await newRefreshToken.save();
    }

    const serviceProvider = await ServiceProviderModel.findOne({
      service_provider_mobile_number: mobile,
    });

    const registered_service_provider = serviceProvider ? 1 : 0;

    return {
      success: true,
      status_code: 200,
      message: "OTP verified successfully",
      mobileNo: user.mobile_number,
      jwt: jwt,
      refresh_token: refreshToken,
      registered_service_provider: registered_service_provider,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Error in OTP verification",
      error: error.message,
    };
  }
};

exports.generateOTP = generateOTP;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
