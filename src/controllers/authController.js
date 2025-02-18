const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/AppRefreshToken");

const authService = require("../services/authService");

exports.sendOtp = async (req, res) => {
  try {
    const { mobile, IpAddress, deviceOS, app_version } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number" });
    }

    const response = await authService.sendOtp({
      mobile,
      IpAddress,
      deviceOS,
      app_version,
    });

    return res.status(response.status_code).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, status_code: 500, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number and OTP required" });
    }

    const response = await authService.verifyOtp({ mobile, otp });

    return res.status(response.status_code).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFcnToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;

    // Extract token from request headers or body
    const token = req.headers["authorization"]?.split(" ")[1]; // Assuming the token is passed in the Authorization header
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "JWT token not provided",
      });
    }

    // Decode JWT token to get the mobile_number
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const mobile_number = decodedToken.mobile;

    // Set default user_type to 'Service Provider'
    const user_type = "Service Provider";

    // Check if mobile_number and user_type exist in the RefreshToken table
    let existingUser = await RefreshToken.findOne({ mobile_number, user_type });

    if (!existingUser) {
      return res.status(200).json({
        success: false,
        message: "Mobile number and user type not found",
      });
    }

    // Update the FCM token in the existing refresh token entry
    existingUser.fcm_token = fcm_token;
    await existingUser.save();

    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "FCM token created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 400,
      message: "Error updating FCM token",
      error: error.message,
    });
  }
};

exports.renewAccessToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    // Find the refresh token in the database
    const existingToken = await RefreshToken.findOne({ token: token });

    if (!existingToken) {
      return res
        .status(400)
        .json({ success: false,status_code: 400, message: "Refresh token not found" });
    }

    // Verify the refresh token
    jwt.verify(token, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Invalid or expired refresh token",
          });
      }

      // Generate a new access token with a 5-minute expiry
      const newAccessToken = jwt.sign(
        { mobile: existingToken.mobile_number },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      return res.status(200).json({
        success: true,
        status_code: 200,
        message: "New jwt token generated successfully",
        jwt: newAccessToken,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 400,
      message: "Error generating new jwt token",
      error: error.message,
    });
  }
};
