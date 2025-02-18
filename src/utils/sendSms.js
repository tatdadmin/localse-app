// utils/smsUtils.js
const axios = require("axios");
require("dotenv").config();

const sendSms = async (mobile, otp) => {
  try {
    const {
      SMS_PASSWORD,
      SMS_SENDERID,
      SMS_USERID,
      SMS_ENTITYID,
      SMS_AUTHKEY,
      SMS_TEMPLATEID,
    } = process.env;

    const Msg = `Do Not Share !\n\nDear Service Provider, Your OTP for login to tat d portal is ${otp} xRy/BCCe0BU. Please do not share this OTP.\n\nTAT D\nhttps://www.tatd.in`;

    const url = `http://nimbusit.net/api/pushsms?user=${encodeURIComponent(
      SMS_USERID
    )}&authkey=${encodeURIComponent(SMS_AUTHKEY)}&password=${encodeURIComponent(
      SMS_PASSWORD
    )}&sender=${encodeURIComponent(SMS_SENDERID)}&mobile=${encodeURIComponent(
      mobile
    )}&text=${encodeURIComponent(Msg)}&entityid=${encodeURIComponent(
      SMS_ENTITYID
    )}&templateid=${encodeURIComponent(SMS_TEMPLATEID)}&rpt=1&type=1`;

    const response = await axios.get(url);

    // ✅ Check if response is an object and contains a valid response code
    if (
      response.data &&
      response.data.STATUS === "OK" &&
      response.data.RESPONSE.CODE === "100"
    ) {
      return {
        success: true,
        message: "OTP sent successfully",
        data: response.data,
      };
    } else {
      console.error("❌ SMS API Error:", response.data);
      return {
        success: false,
        message: "SMS API Failed",
        error: response.data,
      };
    }
  } catch (error) {
    console.error("🚨 Error sending OTP via SMS:", error.message);
    return {
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    };
  }
};

module.exports = { sendSms };
