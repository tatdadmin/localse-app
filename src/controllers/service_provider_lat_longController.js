const jwt = require("jsonwebtoken");
const moment = require("moment");
const ServiceProviderLatLong = require("../models/service_provider_lat_long");

exports.createServiceProviderLatLong = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "JWT token required" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const mobile_number = decodedToken.mobile;

    const newLocation = new ServiceProviderLatLong({
      add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
      // moment().format("YYYY-MM-DD HH:mm:ss"),
      mobile_number,
      latitude,
      longitude,
      place_id: "", 
      address: "" 
    });

    await newLocation.save();
    return res.status(200).json({
        success: true,
        status_code: 200,
        message: "Location added successfully",
        data: newLocation
      });

  } catch (error) {
    return res.status(500).json({ success: false,status_code: 400, message: "Error adding location", error: error.message });
  }
};
