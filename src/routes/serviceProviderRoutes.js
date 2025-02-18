// routes/serviceProviderRoutes.js
const express = require("express");
const router = express.Router();
const {
  createServiceProvider,
  getAllServiceProviders,
  getServiceProviderById,
  updateServiceProvider,
  deleteServiceProvider,
} = require("../controllers/serviceProviderController");
const authenticate = require("../middlewares/authMiddleware");

// Create a service provider
router.post("/create", createServiceProvider);

// Get all service providers
router.get("/get-all", authenticate, getAllServiceProviders);

// Get a service provider by ID
router.get("/get/:id", getServiceProviderById);

// Update a service provider by ID
router.put("/update/:id", updateServiceProvider);

// Delete a service provider by ID
router.delete("/delete/:id", deleteServiceProvider);

module.exports = router;
