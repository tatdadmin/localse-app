const moment = require("moment"); // To handle expiration time
const axios = require("axios");
const jwt = require("jsonwebtoken");
// const ServiceProvider = require("../models/ServiceProvider");
const {
  jwtSecretCustomer,
  AllowedMaxDisBwCustNServiceProv,
  customerRefreshTokenExp,
  customerJWTExp,
  AllowedSearchServiceProviders,
} = require("../config/customerConfig");
const CustomerLatLong = require("../models/CustomerLatLong");
const serviceProviderModel = require("../models/serviceProviderModel");
const { sendSms } = require("../utils/sendSms");
const CustomerRating = require("../models/CustomerRating");
const CustomerDeletedServiceProvider = require("../models/CustomerDeletedServiceProvider");
const CustomerServicesClicks = require("../models/CustomerServicesClicks");
const AppDetails = require("../models/AppDetails");
const AppDevice = require("../models/AppDevice");
const RefreshToken = require("../models/AppRefreshToken");
const Login = require("../models/Login");
const AppLoginAttempt = require("../models/AppLoginAttempt");
const CustomerLatLongHit = require("../models/CustomerLatLongHit");
require("dotenv").config();

async function generateJWT(user, timeInSecond) {
  const payload = {
    iss: "https://www.localse.in",
    aud: "https://www.localse.in",
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + timeInSecond, // Token valid for 30 days
    data: {
      mobile_number: user.mobile_number,
      user_type: "Customer",
      fcm_token: "", // You can pass the FCM token here if needed
    },
  };

  // Sign JWT token
  return jwt.sign(payload, jwtSecretCustomer, { algorithm: "HS256" });
}

async function handleVerifyOtp(req, res) {
  const { mobile, otp, deviceOS, current_app_version } = req.body;
  const user_type = "Customer";
  const db_user= "Customer";
  const expires_at =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)// moment().utc().toDate();
  const currentTime =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)//moment().utc().startOf("second"); // Strip milliseconds from current time

  if (!mobile || !otp) {
    return res
      .status(400)
      .json({ message: "Mobile number and OTP are required" });
  }

  try {
    const loginAttempt = await AppLoginAttempt.findOne({
      mobile: mobile,
      otp,
      user_type,
      db_user,
      expires_at: { $gt: currentTime },
    }).sort({ created_at: -1 });

    if (!loginAttempt) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, proceed with further steps

    const loginExistOfUser = await Login.findOne({ mobile_number: mobile,page_url: "Customer Login" });
    let newLogin;
    if (loginExistOfUser) {
      loginExistOfUser.login_time = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
      await loginExistOfUser.save();
      newLogin = loginExistOfUser;
    } else {
      const loginData = {
        mobile_number: mobile,
        page_url: "Customer Login",
        // user_type: user_type,
        login_time: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
      };

      newLogin = new Login(loginData);
      await newLogin.save();
    }

    // Generate JWT
    const jwtExp = customerJWTExp * 60;
    const jwtToken = await generateJWT(newLogin, jwtExp);

    // Generate refresh token
    const customerRefExp = customerRefreshTokenExp * 24 * 60 * 60;

    const refresh_token = await generateJWT(newLogin, customerRefExp);
    let expiresAt2 = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000); // IST offset
    expiresAt2.setDate(expiresAt2.getDate() + 30); // Add 30 days
    const refresh_token_expiry = expiresAt2;

    // Check if the mobile number already exists in app_refresh_tokens
    let appRefreshToken = await RefreshToken.findOne({
      mobile_number: mobile,
      user_type,
    });

    if (appRefreshToken) {
      // If the token already exists, update it
      appRefreshToken.token = refresh_token;
      appRefreshToken.expires_at = refresh_token_expiry;
      appRefreshToken.app_version = current_app_version || "1.0";
      await appRefreshToken.save();
    } else {
      // If the token doesn't exist, insert a new one
      const newAppRefreshToken = new RefreshToken({
        mobile_number: mobile,
        token: refresh_token,
        expires_at: refresh_token_expiry,
        user_type,
        deviceOS: deviceOS,
        app_version: current_app_version || "1.0",
      });
      await newAppRefreshToken.save();
    }

    await AppLoginAttempt.updateOne(
      { _id: loginAttempt._id },
      { login_status: "1" }
    );
    const existingCustomer = await CustomerLatLong.findOne({
      mobile_number: mobile,
    });

    let existing_customer = "0";
    if (existingCustomer) {
      existing_customer = "1";
    }
    // Return the response with JWT, refresh token, and registered status
    return res.status(200).json({
      status_code: 200,
      message: "OTP verified successfully",
      jwt: jwtToken,
      refresh_token,
      existing_customer,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Function to generate a 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
}

async function sendMessageTemplate(Phno, Msg, TemplateID) {
  const Password = "tatd@dash";
  const SenderID = "TATDIN";
  const UserID = "hemantnet";
  const EntityID = "1201159186087951215";
  const authkey = "92arLm7wIlDhc";

  // Constructing the URL with query parameters
  const url = `http://nimbusit.net/api/pushsms?user=${UserID}&authkey=${authkey}&sender=${SenderID}&mobile=${Phno}&text=${encodeURIComponent(
    Msg
  )}&entityid=${EntityID}&templateid=${TemplateID}&rpt=1&type=1`;

  try {
    // Send the GET request to the API
    const response = await fetch(url);

    // Parse the JSON response
    const data = await response.json();

    // Log the response data
    console.log("Response:", data);

    // Return the data (can be used further)
    return data;
  } catch (error) {
    // Handle any errors
    console.error("Error sending message:", error);
    throw error; // You can handle the error as needed
  }
}

// The main function to handle the login attempt and OTP logic
async function handleLoginAttempt(req, res) {
  const { mobile, current_app_version, deviceOS, IpAddress } = req.body;

  if (!mobile) {
    return res
      .status(400)
      .json({ status_code: "400", message: "Mobile number is required" });
  }

  const otp = generateOTP(); // Generate OTP
    const expiresAt = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  const expires_at =  expiresAt// moment().utc().add(10, "minutes").toDate(); //.format('YYYY-MM-DD HH:mm:ss'); // OTP valid for 10 minutes
  const current_time =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000); //.format('YYYY-MM-DD HH:mm:ss');
  const user_type = "Customer";
  const db_user = "Customer"; // This can be dynamic if needed

  try {
    // Check if there's an existing OTP for the mobile number
    const existingLoginAttempt = await AppLoginAttempt.findOne({
      mobile,
      expires_at: { $gt: current_time }, // Check if OTP is still valid
      user_type,
    }).sort({ created_at: -1 });

    let flag = false;

    if (existingLoginAttempt) {
      // If there's an active OTP, update it
      existingLoginAttempt.otp = otp;
      existingLoginAttempt.expires_at = expires_at;
      existingLoginAttempt.deviceOS = deviceOS;
      existingLoginAttempt.app_version = current_app_version;

      await existingLoginAttempt.save();
      flag = true;
    } else {
      // No valid OTP exists, insert a new record
      const newLoginAttempt = new AppLoginAttempt({
        created_at: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
        mobile,
        otp,
        expires_at,
        IpAddress,
        user_type,
        db_user,
        deviceOS,
        app_version: current_app_version,
      });

      await newLoginAttempt.save();
      flag = true;
    }

    if (flag) {
      await sendSms(mobile, otp);

      res
        .status(200)
        .json({
          status_code: "200",
          message: "OTP sent successfully",
          otp: otp,
        });
    } else {
      res
        .status(500)
        .json({ status_code: "500", message: "Failed to generate OTP" });
    }
  } catch (err) {
    console.error("Error handling OTP:", err);
    res
      .status(500)
      .json({ status_code: "500", message: "Internal Server Error" });
  }
}
async function getCustomerlatlong(req,res){
  try {
    const mobileNumber = req.user.mobile_number;
    // const existingCustomerLatLong = await CustomerLatLong.find({
    //   mobile_number: mobileNumber,
    // }).sort({ add_date: -1 });
    const existingCustomerLatLong = await CustomerLatLong.aggregate([
      { $match: { mobile_number: mobileNumber } }, // Filter by mobile number
      { $sort: { add_date: -1 } },                // Sort by add_date in descending order (most recent first)
      { $group: {
          _id: "$address",                        // Group by address
          latestEntry: { $first: "$$ROOT" }        // Get the first document (most recent) for each address
        }
      },
      { $replaceRoot: { newRoot: "$latestEntry" } }, // Replace with the latest entry per address
      { $sort: { add_date: -1 } }                // Sort the results by add_date in descending order to keep the most recent first
    ]);
    
    if(!existingCustomerLatLong){
      return res.status(404).json({
        status_code:404,
        message:"Customer LatLong data doesnot Exist in Database"
      })
    }
    return res.status(200).json({
      status_code:200,
      message:"customer latlong data found Successfully",
      data:existingCustomerLatLong
    })
  } catch (error) {
    console.error("Error in Getting Customer LatLong", err);
    res
      .status(500)
      .json({ status_code: "500", message: "Internal Server Error" });
  }
}

async function handleCustomerCurrentAddress(req, res) {
  try {
    const mobileNumber = req.user.mobile_number;
    const { latitude, longitude, place_id, address, action } = req.body;

    // Validate that required fields are provided in the body
    if (!latitude || !longitude || !place_id || !address || !action) {
      return res
        .status(400)
        .json({ message: "Missing required fields in request body" });
    }
    if (action !== "save_location") {
      return res
        .status(422)
        .json({ message: "action is not appropriate to save location" });
    }

    // const existingCustomerLatLong = await CustomerLatLong.findOne({
    //   mobile_number: mobileNumber,
    // });
    // if (existingCustomerLatLong) {
    //   // If the customer exists, update their lat-long data
    //   existingCustomerLatLong.latitude = latitude;
    //   existingCustomerLatLong.longitude = longitude;
    //   existingCustomerLatLong.place_id = place_id;
    //   existingCustomerLatLong.address = address;
    //   existingCustomerLatLong.add_date = new Date(); // Update the add_date to current time

    //   await existingCustomerLatLong.save(); // Save the updated customer info

    //   return res
    //     .status(200)
    //     .json({
    //       status_code: 200,
    //       message: "Customer lat-long information updated successfully",
    //     });
    // } else {

    const currentIST = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
      const newCustomerLatLong = new CustomerLatLong({
        mobile_number: mobileNumber,
        add_date: currentIST,
        latitude,
        longitude,
        place_id,
        address,
      });

      await newCustomerLatLong.save();

      return res
        .status(200)
        .json({
          status_code: 200,
          message: "Customer lat-long information saved successfully",
        });
    // }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function saveFCMToken(req, res) {
  try {
    const mobileNumber = req.user.mobile_number;
    const userType = req.user.user_type;

    const fcmToken = req.body.fcm_token;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    // Find the CustomerAppRefreshTokens /RefreshToken (appRefreshToken) document for the mobile number and user type
    let appRefreshToken = await RefreshToken.findOne({
      mobile_number: mobileNumber,
      user_type: userType,
    });

    // If the document doesn't exist, return an error response
    if (!appRefreshToken) {
      return res
        .status(404)
        .json({
          status_code: 404,
          message:
            "App refresh token not found for this mobile number and user type",
        });
    }

    // Update the FCM token field
    appRefreshToken.fcm_token = fcmToken;

    // Save the updated document
    await appRefreshToken.save();

    // Send a success response
    return res
      .status(200)
      .json({
        status_code: 200,
        message: `FCM token added for mobile number ${mobileNumber} and user type ${userType}`,
      });
  } catch (error) {
    console.error("Error in saveFCMToken:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred while saving the FCM token",
        error: error.message,
      });
  }
}

async function saveUserAppDeviceInfo(req, res) {
  try {
    const {
      manufacturer,
      model,
      deviceName,
      systemName,
      systemVersion,
      appVersion,
      buildNumber,
      isTablet,
      action,
    } = req.body;

    if (!model || !deviceName || !systemName || !systemVersion || !appVersion || !buildNumber ) {
      return res.status(400).json({
        message: "Please add all the required fields",
        status_code: 400,
      });
    }
    
    
    const mobileNumber = req.user.mobile_number;
    const userType = req.user.user_type;
    // const isTabletValue = reqisTablet;
      // isTablet === "true" || isTablet === true ? true : false;

    // Find the app device using the mobile_number and user_type
    const existingDevice = await AppDevice.findOne({
      mobile_number: mobileNumber,
      user_type: userType,
    });

    if (existingDevice) {
      // If device exists, update the details
      existingDevice.action = action || existingDevice.action;
      existingDevice.manufacturer = manufacturer || existingDevice.manufacturer;
      existingDevice.model = model || existingDevice.model;
      existingDevice.deviceName = deviceName || existingDevice.deviceName;
      existingDevice.systemName = systemName || existingDevice.systemName;
      existingDevice.systemVersion =
        systemVersion || existingDevice.systemVersion;
      existingDevice.appVersion = appVersion || existingDevice.appVersion;
      existingDevice.buildNumber = buildNumber || existingDevice.buildNumber;
      // existingDevice.isTablet = isTablet || existingDevice.isTablet;
      existingDevice.isTablet = isTablet || existingDevice.isTablet;
      existingDevice.updatedAt= new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));

      // Save the updated device information
      await existingDevice.save();

      return res.status(200).json({
        status_code: 200,
        message: "Device info updated successfully.",
      });
    } else {
      // If the device does not exist, create a new one
      const newDevice = new AppDevice({
        add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
        mobile_number: mobileNumber,
        user_type: userType,
        manufacturer: manufacturer || "",
        model,
        deviceName,
        systemName,
        systemVersion,
        appVersion,
        buildNumber,
        isTablet: isTablet || '',
        // isTablet: isTabletValue,
        action,
      });

      // Save the new device information
      await newDevice.save();

      return res.status(200).json({
        status_code: 200,
        message: "Device info saved successfully.",
      });
    }
  } catch (error) {
    console.error("Error saving or updating device info:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
async function getServiceTypeFromServiceProvide(req, res) {
  try {
    const mobileNumber = req.user.mobile_number;
    const existingLogin = await Login.findOne({ mobile_number: mobileNumber,page_url: "Customer Login", });
    if (!existingLogin) {
      return res
        .status(404)
        .json({ message: "User not found with provided JWT in Login DB" });
    }
    // finding customer's LangLong data
    const existingCustomerLatLong = await CustomerLatLong.findOne({
      mobile_number: mobileNumber,
    }).sort({ add_date: -1 });

    if (!existingCustomerLatLong) {
      return res
        .status(404)
        .json({ message: "customer's latLong Data Not Found" });
    } else {
      if (
        existingCustomerLatLong.longitude === "" ||
        existingCustomerLatLong.latitude === ""
      ) {
        const serviceTypes = await serviceProviderModel.distinct(
          "service_type"
        );
        return res.status(200).json({status_code:200, data: serviceTypes });
      } else {
        const existingCustomerLattitude = parseFloat(
          existingCustomerLatLong.latitude
        );
        const existingCustomerLongitude = parseFloat(
          existingCustomerLatLong.longitude
        );
        const serviceProviders = await serviceProviderModel.find({
          active_status: "1",
          panel_login: "1"
        });

        const nearbyServiceProviders = serviceProviders
          .filter((provider) => {
            const [providerLatitude, providerLongitude] =
              provider.current_latlong
                .split(",")
                .map((coord) => parseFloat(coord));
            const distance = calculateDistance(
              existingCustomerLattitude,
              existingCustomerLongitude,
              providerLatitude,
              providerLongitude
            );
            return distance <= AllowedMaxDisBwCustNServiceProv;
          })
          .map((provider) => provider.service_type);

        const distinctServices = [...new Set(nearbyServiceProviders)];
        return res
          .status(200)
          .json({ status_code: 200, data: distinctServices,
              address:existingCustomerLatLong.address,
              CustomerLatLongData: `${existingCustomerLattitude},${existingCustomerLongitude}`
           });
      }
    }
  } catch (error) {
    console.error("Error in getting service type from service provider", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// function to find distance bw 2 latlong addresses
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}
async function generateJWTTokenWithRefreshToken(req, res) {
  try {
    // const custRefreshTokExp = customerRefreshTokenExp * 60;
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res
        .status(403)
        .json({ success: false, message: "No token provided in JSON Body" });
    }
    const user = await verifyAndDecodeToken(refresh_token);

    if (user.success) {
      const userData = user.data;
      const normalizedUser = {
        mobile_number: userData.mobile_number, // Normalize mobile to mobile_number
        user_type: userData.user_type,
      };
      const newJWT = await generateJWT(normalizedUser, customerJWTExp * 60); // 5 minutes expiration time (in seconds)

      return res.status(200).json({
        status_code: 200,
        success: true,
        message: "New JWT generated successfully",
        jwt: newJWT, // Send the new JWT token to the user
      });
    } else {
      return res.status(403).json({ success: false, message: user.message });
    }
  } catch (error) {
    console.error("Error in JWT generation", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function verifyAndDecodeToken(token) {
  if (!token) {
    return { success: false, message: "Token is required for authentication" };
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecretCustomer);

    // If the token is valid, return the decoded data
    return { success: true, data: decoded.data };
  } catch (err) {
    return { success: false, message: "Invalid or expired token" };
  }
}

async function filterSearchServiceTypeApi(req, res) {
  try {
    const mobileNumber = req.user.mobile_number;
    const keyword = req.query.keyword;
    const existingCustomerLatLong = await CustomerLatLong.findOne({
      mobile_number: mobileNumber,
    }).sort({ add_date: -1 });
    if (!existingCustomerLatLong) {
      return res
        .status(404)
        .json({
          status_code: 404,
          message: "Customer Lat Long data Not Found",
        });
    }
    if (
      existingCustomerLatLong.latitude == "" ||
      existingCustomerLatLong.longitude == ""
    ) {
      const serviceTypes = await serviceProviderModel.distinct(
        "service_type"
      );
      const filteredServicesBasedUponKey = serviceTypes.filter((service) =>
        service.toLowerCase().startsWith(keyword.toLowerCase()));


      return res.status(200).json({
        status_code:200,
        data: filteredServicesBasedUponKey,
        message: "Service Type retrieved Successfully"
       });
    } else {
      const existingCustomerLattitude = parseFloat(
        existingCustomerLatLong.latitude
      );
      const existingCustomerLongitude = parseFloat(
        existingCustomerLatLong.longitude
      );
      const serviceProviders = await serviceProviderModel.find({
          active_status: "1",
          panel_login: "1"
      });
      const nearbyServiceProviders = serviceProviders
        .filter((provider) => {
          const [providerLatitude, providerLongitude] = provider.current_latlong
            .split(",")
            .map((coord) => parseFloat(coord));
          const distance = calculateDistance(
            existingCustomerLattitude,
            existingCustomerLongitude,
            providerLatitude,
            providerLongitude
          );
          return distance <= AllowedMaxDisBwCustNServiceProv;
        })
        .map((provider) => provider.service_type);

      const distinctServices = [...new Set(nearbyServiceProviders)];

      const filteredServicesBasedUponKey = distinctServices.filter((service) =>
        service.toLowerCase().startsWith(keyword.toLowerCase())
      );
      return res
        .status(200)
        .json({ 
          status_code: 200, 
          data: filteredServicesBasedUponKey,
          message: "Service Type retrieved Successfully",
          CustomerLatLongData: `${existingCustomerLattitude},${existingCustomerLongitude}`,
          address: existingCustomerLatLong.address
         });
    }

  } catch (error) {
    console.error("Error In searching Service Types", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

async function getServiceProviderListBasedOnServicesType(req,res){
  try {
    const mobileNumber = req.user.mobile_number;
    const serviceType= req.query.service_type;
    if(!serviceType){
      return res.status(404).json({
        message: "service_type not given in param",
        status:404
      })
    }
    const existingCustomerLatLong = await CustomerLatLong.findOne({
      mobile_number: mobileNumber,
    }).sort({ add_date: -1 });
    if (!existingCustomerLatLong) {
      return res
        .status(404)
        .json({
          status_code: 404,
          message: "Customer Lat Long data Not Found",
        });
    }
    if (
      existingCustomerLatLong.latitude == "" ||
      existingCustomerLatLong.longitude == ""
    ){
      const serviceProviders = await serviceProviderModel.find({
        // service_type: { $regex: new RegExp(`^${serviceType}$`, 'i') }
        service_type: { $regex: new RegExp(serviceType, 'i') },
        active_status:"1",
        panel_login: "1"
      });

      return res.status(200).json(
        {
          message: "Service Providers Listing retrieved successfully",
          status_code:200,
          data: serviceProviders
        }
      )
    }
    else{
      const serviceProviders = await serviceProviderModel.find({
        // service_type: { $regex: new RegExp(`^${serviceType}$`, 'i') }
        service_type: { $regex: new RegExp(serviceType, 'i') },
        active_status:"1",
        panel_login: "1"
      });
      const existingCustomerLattitude = parseFloat(
        existingCustomerLatLong.latitude
      );
      const existingCustomerLongitude = parseFloat(
        existingCustomerLatLong.longitude
      );

      // console.log("lin 706",existingCustomerLattitude,existingCustomerLongitude)

      const nearbyServiceProviders = serviceProviders
          .map((provider) => {
            // Split the provider's latlong and parse them into floats
            const [providerLatitude, providerLongitude] = provider.current_latlong
              .split(",")
              .map((coord) => parseFloat(coord));

            // Calculate the distance between the customer and the provider
            const distance = calculateDistance(
              existingCustomerLattitude,
              existingCustomerLongitude,
              providerLatitude,
              providerLongitude
            );

            // Add the calculated distance to the provider object
            provider.distance = distance;
            return provider;
          })
          .filter((provider) => provider.distance <= AllowedSearchServiceProviders) // Filter based on the allowed radius
          .sort((a, b) => a.distance - b.distance); // Sort providers by distance (ascending)

          let newJson = nearbyServiceProviders.map(provider => {
            // If the provider is a Mongoose Document, convert it to a plain JavaScript object
            const plainProvider = provider.toObject ? provider.toObject() : provider; // Ensures we're working with a plain object
            
            // Extract the current latlong of the service provider
            const [providerLat, providerLon] = plainProvider.current_latlong.split(',').map(Number);
          
            // Calculate the distance between the customer and the service provider
            const distance = calculateDistance(existingCustomerLattitude, existingCustomerLongitude, providerLat, providerLon);
          
            // Add the new fields to the service provider object
            return {
              ...plainProvider, // Spread the plain provider object
              distance, // Add the calculated distance
              service_provider_address: plainProvider.aadhaar_address,
              service_provider_img_src: plainProvider.service_provider_image,
            };
          });
          // filtering list data according to CustomerDeletedSErviceProvider that dont need to be shown
          const deletedData= await CustomerDeletedServiceProvider.find({
            mobile_number:mobileNumber,
          });

          // Get the list of deleted service provider mobileNumber
          const deletedServiceProviderMobileNumber = deletedData.map(item => item.service_provider_mobile_number);
          // Filter out the entries in `newJson` where the service_provider_mobile_number exists in deletedIds
          const filteredData = newJson.filter(item => !deletedServiceProviderMobileNumber.includes(item.service_provider_mobile_number));

      return res.status(200).json(
        {
          message: "Service Providers Listing retrieved successfully",
          status_code:200,
          data: filteredData,
          address: existingCustomerLatLong.address,
          CustomerLatLongData: `${existingCustomerLatLong.latitude},${existingCustomerLatLong.longitude}` 
        }
      )
    }

  } catch (error) {
    console.error("Error In Searching Service Provider Based upon services", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

async function insertRatingToServiceProvider(req,res){
  try {
    const customer_number = req.user.mobile_number;
    const {service_provider_id,rating,remarks} = req.body;

    if (!service_provider_id || !rating || rating < 1 || rating > 5 ) {
      return res.status(400).json({ error: 'Invalid data: rating must be between 1 and 5 & service provider Id should be given' });
    }

    const serviceProvider = await serviceProviderModel.findOne({ _id: service_provider_id });

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const existingCustomerRatingToServiceProvider= await CustomerRating.findOne({
      customer_number:customer_number,
      service_provider_number:serviceProvider.service_provider_mobile_number
    })

    if(!existingCustomerRatingToServiceProvider){
      const newRating = new CustomerRating({
        customer_number:customer_number,
        service_provider_number: serviceProvider.service_provider_mobile_number,
        rating: parseFloat(rating),
        remarks: remarks || '',
        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      });
      await newRating.save();
      const avgRatingOfProvider= await getAverageRatingOfServiceProvider(serviceProvider.service_provider_mobile_number);
      serviceProvider.rating= avgRatingOfProvider;
      await serviceProvider.save();
      return res.status(200).json({
        status_code:200,
        message:"rating is saved succeessfully",
      })
    }
    else{
      existingCustomerRatingToServiceProvider.rating= parseFloat(rating);
      existingCustomerRatingToServiceProvider.remarks= remarks || "";
      existingCustomerRatingToServiceProvider.update_date= new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      await existingCustomerRatingToServiceProvider.save();

      const avgRatingOfProvider= await getAverageRatingOfServiceProvider(serviceProvider.service_provider_mobile_number);
      serviceProvider.rating= avgRatingOfProvider;
      await serviceProvider.save();
      return res.status(200).json({
        status_code:200,
        message: "rating is saved succeessfully"
      })
    }

  } catch (error) {
    console.error("Error In Inserting Rating To Service Provider", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}
async function getAverageRatingOfServiceProvider(mobileNum){
  try {
    const ratings = await CustomerRating.find({
      service_provider_number: mobileNum
    }).select('rating'); // Only select the rating field

    const numberOfRatings= ratings.length;
    // console.log("line 827",ratings);
    if (numberOfRatings === 0) {
      return {
        numberOfRatings: 0,
        averageRating: 0
      };
    }

    // Step 3: Calculate the average rating
    const totalRating = ratings.reduce((sum, ratingObj) => sum + ratingObj.rating, 0);
    const averageRating = totalRating / numberOfRatings;

    return averageRating;

  } catch (error) {
    console.error("Error In Getting Average Rating of Service Provider", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

async function showRatingModel(req,res){
  try {
    return res.status(200).json(
      {
        "status_code": 200,
        "message": "Modal content retrieved successfully",
        "data": {
          "modal_title": "Rate Your Experience",
          "feedback_message": "We value your feedback! Please rate your experience and leave a comment.",
          "submit_button_text": "Submit",
          "close_button_text": "Close",
          "placeholder": "Leave your remarks here..."
        }
      }
      
    )
  } catch (error) {
    console.error("Error in Getting Rating Model", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

async function serviceProviderDelete(req,res){
  try {
    const customer_number = req.user.mobile_number;
    const {service_provider_id} = req.body;

    const serviceProvider = await serviceProviderModel.findOne({ _id: service_provider_id });

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const existingServiceProviderDeletedData= await CustomerDeletedServiceProvider.findOne({
      mobile_number:customer_number,
      service_provider_mobile_number:serviceProvider.service_provider_mobile_number
    })

    if(!existingServiceProviderDeletedData){
     const CustomerData = new CustomerDeletedServiceProvider({
      mobile_number:customer_number,
      service_provider_mobile_number: serviceProvider.service_provider_mobile_number,
      add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
     }) ;

     await CustomerData.save();

     return res.status(200).json({
      status_code:200,
      message: "Deleted Successfully"
     })
    }
    else{
      return res.status(200).json({
        status_code:200,
        message:"Data Already Deleted"
      })
    }

  } catch (error) {
    console.error("Error in Deleting Service Provider", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

async function HandleStoreClick(req,res){
  try {
    const customer_number = req.user.mobile_number;
    const {service_provider_id,click_on} = req.body;
    if( !service_provider_id || !click_on){
      return res.status(400).json({ error: 'Invalid data: please provide click_on and service provider id' });
    }

    const serviceProvider = await serviceProviderModel.findOne({ _id: service_provider_id });
    // console.log("line 942",serviceProvider);
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    const existingCustomerServicesClicks = await CustomerServicesClicks.findOne({
      customer_mobile_number:customer_number,
      service_provider_mobile_number:serviceProvider.service_provider_mobile_number,
      add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    })
    if(!existingCustomerServicesClicks){
      const newCustomerServiceClickData= new CustomerServicesClicks({
        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
        customer_mobile_number:customer_number,
        service_provider_mobile_number:serviceProvider.service_provider_mobile_number,
        service_type:serviceProvider.service_type,
        click_on:click_on
      });
      await newCustomerServiceClickData.save();
      return res.status(200).json({
        status_code:200,
        message:"Click Saved successfully"
      })
    }
    else{
      return res.status(200).json({status_code:200, message:"Click is Already Saved"})
    }
  
  } catch (error) {
    console.error("Error in Store Click Api", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}
async function getAppVersionInfo(req,res){
  try {
    const {user_type,app_type, status}= req.body;
    if(!user_type || !app_type || !status){
      return res.status(400).json({ error: 'Invalid data, Please provide user_type, app_type, and status in req body' });
    }
    const appDetailsData= await AppDetails.findOne({
      user_type: user_type,
      app_type: app_type,
      status: status
    });
    if(appDetailsData){
      return res.status(200).json({
        status_code:200,
        message:"App Details retrieved Successfuly",
        data:appDetailsData
      });
    }else{
      return res
        .status(400)
        .json({
          status_code: 400,
          message:
            "No Details Found for such request",
        });
    }
  } catch (error) {
    console.log("Error in getting App Version Info",error)
    return res
    .status(500)
    .json({ status_code: 500, message: "Internal server error" });
  }
}
async function customerLatLongHit(req,res){
  try {
    const customer_number = req.user.mobile_number;
    const {latitude, longitude, place_id, pickup_address, api_type, api_hit_url} = req.body;

    // if(!latitude || !longitude || !place_id || !pickup_address || !api_hit_url || !api_type){
    //   return res.status(400).json({
    //     status_code: 400,
    //     message: "plz enter the request body fields"
    //   })
    // }

    const newCustomerData= new CustomerLatLongHit({
      mobile_number:customer_number,
      add_date: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      latitude,
      longitude,
      place_id,
      pickup_address,
      api_type,
      api_hit_url
    });

    await newCustomerData.save();
    return res.status(200).json({
      status_code:200,
      message: "Data inserted Successfully",
    })
    
  } catch (error) {
    console.log("Error in Customer LatLong hit api",error)
    return res
    .status(500)
    .json({ status_code: 500, message: "Internal server error" });
  }
}
module.exports = {
  handleLoginAttempt,
  handleVerifyOtp,
  handleCustomerCurrentAddress,
  getCustomerlatlong,
  saveFCMToken,
  saveUserAppDeviceInfo,
  getServiceTypeFromServiceProvide,
  generateJWTTokenWithRefreshToken,
  filterSearchServiceTypeApi,
  getServiceProviderListBasedOnServicesType,
  insertRatingToServiceProvider,
  showRatingModel,
  serviceProviderDelete,
  HandleStoreClick,
  getAppVersionInfo,
  customerLatLongHit
};
