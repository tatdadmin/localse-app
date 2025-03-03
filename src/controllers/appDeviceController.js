const jwt = require('jsonwebtoken');

const AppDevice = require('../models/AppDevice');

// Create a new device
exports.createDevice = async (req, res) => {
    try {
      // Extract the JWT token from the Authorization header
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
      }
  
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      // Get the mobile number from the decoded JWT token
      const mobile_number = decoded.mobile;
  
      // Prepare the device data, including the mobile number and current date for add_date
      const newDeviceData = {
        ...req.body, // All other fields from the request body
        mobile_number, // Mobile number from the token
        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)), // Set add_date to current date
      };
  
      // Create the new device
      const newDevice = new AppDevice(newDeviceData);
  
      // Save the device to the database
      await newDevice.save();
  
      // Respond with the success message
      res.status(200).json({
        success: true,
        status_code: 200,
        message: 'Device created successfully',
        data: newDevice, // Returning the created device data
      });
    } catch (err) {
      res.status(400).json({ message: err.message,status_code: 400 });
    }
  };

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await AppDevice.find();

    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "Devices retrieved successfully",
      devices: devices,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error fetching devices",
      error: err.message || "Internal Server Error",
    });
  }
};

// Get a device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await AppDevice.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a device by ID
exports.updateDevice = async (req, res) => {
  try {
    const updatedDevice = await AppDevice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDevice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a device by ID
exports.deleteDevice = async (req, res) => {
  try {
    await AppDevice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Device deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
