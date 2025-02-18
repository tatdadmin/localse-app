const jwt = require("jsonwebtoken");
const moment = require("moment");
const axios = require("axios");
const AadhaarVerificationAttempt = require("../models/ZAadharVerificationAttempt");
const AadharVerification = require("../models/serviceProviderAadharVerification");

exports.sendAadhaarOTP = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "JWT token is required in the Authorization header",
      });
    }

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    } catch (err) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "Invalid or expired token",
      });
    }

    // Extract request body data
    const {
      service_provider_mobile_number,
      service_type,
      service_provider_manual_address,
      service_provider_aadhar_number,
      service_provider_image,
    } = req.body;

    if (!service_provider_aadhar_number) {
      return res.status(400).json({
        success: false,
        status_code: 400,
        message: "Aadhaar number is required",
      });
    }

    // Check the last Aadhaar verification attempt for cooldown logic
    const lastAttempt = await AadhaarVerificationAttempt.findOne({
      mobile_number: service_provider_mobile_number,
      aadhaar_number: service_provider_aadhar_number,
    }).sort({ _id: -1 });

    const currentTime = moment();
    if (
      lastAttempt &&
      moment(lastAttempt.end_date, "YYYY:MM:DD:HH:mm:ss").isAfter(currentTime)
    ) {
      return res.status(200).json({
        success: false,
        status_code: 200,
        msg_type: "error",
        message: `Your previous attempt to verify Aadhaar was unsuccessful. You can try again at ${moment(
          lastAttempt.end_date,
          "YYYY:MM:DD:HH:mm:ss"
        ).format("hh:mm A")}.`,
      });
    }


    // Call the external API to generate Aadhaar OTP
    const otpResponse = await axios.post(
      "https://kyc-api.surepass.io/api/v1/aadhaar-v2/generate-otp",
      {
        id_number: service_provider_aadhar_number,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AADHAAR_API_KEY}`,
        },
      }
    );

    const responseData = otpResponse.data;

    if (
      responseData.status_code === 200 &&
      responseData.message === "OTP Sent." &&
      responseData.success === true || responseData.success === '1'
    ) {
      
    // Generate timestamp for the new attempt
      const start_date = moment().format("YYYY:MM:DD:HH:mm:ss");
      const end_date = moment().add(5, "minutes").format("YYYY:MM:DD:HH:mm:ss");

      // Save the new Aadhaar verification attempt with cooldown period
      const newAttempt = new AadhaarVerificationAttempt({
        mobile_number: service_provider_mobile_number,
        aadhaar_number: service_provider_aadhar_number,
        start_date: start_date,
        end_date: end_date,
      });
      await newAttempt.save();

      return res.status(200).json({
        success: true,
        status_code: 200,
        message: "OTP sent successfully",
        aadhaar_client_id: responseData.data.client_id,
      });
    } else {
      return res.status(200).json({
        success: false,
        status_code: 200,
        msg_type: "error",
        message:
          "आपका दिए हुए आधार नंबर पर आपका मोबाइल नंबर रजिस्टर नहीं है, कृपया नजदीकी आधार सेंटर पर जाकर अपने आधार नंबर पर अपना मोबाइल नंबर जोड़वा लें।",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.verifyAadhaarOTP = async (req, res) => {
  try {
    const { otp, aadhaar_client_id } = req.body;

    // Extract the token from the request header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ status_code: 401, message: "JWT token required" });
    }

    // Decode the token and extract the mobile_number
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    } catch (err) {
      return res
        .status(401)
        .json({ status_code: 401, message: "Invalid or expired token" });
    }

    const mobile_number = decodedToken.mobile; // Get the mobile number from the token
    console.log("Mobile Number from JWT:", mobile_number);

    // Validate that the OTP and client ID are provided
    if (!otp || !aadhaar_client_id) {
      return res
        .status(400)
        .json({
          status_code: 400,
          message: "Aadhaar Client ID or OTP is missing",
        });
    }

    // Call the external API for OTP verification
    const response = await axios.post(
      "https://kyc-api.surepass.io/api/v1/aadhaar-v2/submit-otp",
      {
        client_id: aadhaar_client_id,
        otp: otp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AADHAAR_API_KEY}`,
        },
      }
    );

    const responseData = response.data;

    if (responseData.status_code !== 200 || !responseData.success) {
      return res.status(400).json({ status_code: 400, message: "Invalid OTP" });
    }

    const existingAadhaarVerification = await AadharVerification.findOne({
      mobile_number: mobile_number,
      aadhaar_number: responseData.data.aadhaar_number,
    });

    if (existingAadhaarVerification) {
      return res.status(200).json({
        status_code: 200,
        message: "Aadhaar OTP verified successfully",
      });
    }

    // Save verified data to MongoDB (assuming you have the model for this)
    const aadhaarData = {
      add_date: new Date(),
      mobile_number, // Add the mobile number from the decoded JWT
      aadhaar_number: responseData.data.aadhaar_number,
      ad_client_id: responseData.data.client_id,
      ad_full_name: responseData.data.full_name,
      ad_dob: responseData.data.dob,
      ad_gender: responseData.data.gender,
      ad_address_country: responseData.data.address?.country || "",
      ad_address_distic: responseData.data.address?.dist || "",
      ad_address_state: responseData.data.address?.state || "",
      ad_address_po: responseData.data.address?.po || "",
      ad_address_location: responseData.data.address?.loc || "",
      ad_address_vtc: responseData.data.address?.vtc || "",
      ad_address_subdist: responseData.data.address?.subdist || "",
      ad_address_street: responseData.data.address?.street || "",
      ad_address_house: responseData.data.address?.house || "",
      ad_address_landmark: responseData.data.address?.landmark || "",
      ad_face_status: responseData.data.face_status || "",
      ad_face_score: responseData.data.face_score || "",
      ad_zip: responseData.data.zip || "",
      ad_profile_image: responseData.data.profile_image || "",
      ad_has_image: responseData.data.has_image || "",
      ad_email_hash: responseData.data.email_hash || "",
      ad_mobile_hash: responseData.data.mobile_hash || "",
      ad_raw_xml: responseData.data.raw_xml || "",
      ad_zip_data: responseData.data.zip_data || "",
      ad_care_of: responseData.data.care_of || "",
      ad_share_code: responseData.data.share_code || "",
      ad_mobile_verified: responseData.data.mobile_verified || "",
      ad_reference_id: responseData.data.reference_id || "",
      ad_aadhaar_pdf: responseData.data.aadhaar_pdf || "",
      ad_status: responseData.data.status || "",
      ad_uniqueness_id: responseData.data.uniqueness_id || "",
      ad_status_code: responseData.status_code,
      ad_success: responseData.success,
      ad_message: responseData.message,
      ad_message_code: responseData.message_code,
    };

    await AadharVerification.create(aadhaarData);

    return res.status(200).json({
      status_code: 200,
      message: "OTP verified and data saved successfully",
    });
  } catch (error) {
    console.error("Error verifying Aadhaar OTP:", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
};
