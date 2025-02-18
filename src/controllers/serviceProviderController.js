// controllers/serviceProviderController.js
const ServiceProvider = require("../models/serviceProviderModel");

// Create a new service provider
exports.createServiceProvider = async (req, res) => {
    try {
      const { service_provider_email, service_provider_mobile_number } = req.body;
  
      // Check if email already exists
      const existingEmail = await ServiceProvider.findOne({ service_provider_email });
      if (existingEmail) {
        return res.status(400).json({
          status_code: 400,
          message: 'This email already exists.'
        });
      }
  
      // Check if mobile number already exists
      const existingPhone = await ServiceProvider.findOne({ service_provider_mobile_number });
      if (existingPhone) {
        return res.status(400).json({
          status_code: 400,
          message: 'This phone number already exists.'
        });
      }
  
      // Create a new service provider
      const serviceProvider = new ServiceProvider(req.body);
  
      await serviceProvider.save();
  
      res.status(201).json({
        status_code: 200,
        message: 'Service provider created successfully.',
        serviceProvider
      });
    } catch (error) {
      res.status(500).json({ status_code: 400,message: 'Server error', error });
    }
  };

// Get all service providers
exports.getAllServiceProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.status(200).json({
      statu_code: 200,
      success: true,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single service provider by ID
exports.getServiceProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update service provider by ID
exports.updateServiceProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    res.status(200).json({
      success: true,
      message: "Service provider updated successfully",
      data: provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete service provider by ID
exports.deleteServiceProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    res.status(200).json({
      success: true,
      message: "Service provider deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
