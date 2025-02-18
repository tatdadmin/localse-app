// models/ServiceProvider.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Service Provider Schema
const ServiceProviderSchema = new Schema({
  add_date: {
    type: Date,
    default: Date.now, // Automatically set the current timestamp for add_date
  },
  service_provider_id: {
    type: String,
    required: true,
    maxlength: 15,  // Ensures the service_provider_id does not exceed 15 characters
  },
  service_type: {
    type: String,
    required: true,
    maxlength: 30,  // Ensures the service_type does not exceed 30 characters
  },
  service_category: {
    type: String,
    required: true,
    maxlength: 100,  // Ensures the service_category does not exceed 100 characters
  },
  service_provider_name: {
    type: String,
    required: true,
    maxlength: 100,  // Ensures the service_provider_name does not exceed 100 characters
  },
  service_provider_mobile_number: {
    type: String,
    required: true,
    maxlength: 10,  // Ensures the mobile number length does not exceed 10 characters
  },
  language: {
    type: String,
    enum: ['Hindi', 'English'],  // Only allows 'Hindi' or 'English'
    required: true,
  },
  service_provider_email: {
    type: String,
    required: true,
    maxlength: 40,  // Ensures the email does not exceed 40 characters
  },
  service_area: {
    type: String,
    required: true,
    maxlength: 100,  // Ensures the service_area does not exceed 100 characters
  },
  rating: {
    type: Number,
    default: 4.0,  // Default rating is 4.0
    min: 0,  // Rating cannot be less than 0
    max: 5,  // Rating cannot be more than 5
  },
  service_provider_aadhar_number: {
    type: String,
    required: true,
    maxlength: 16,  // Ensures the Aadhar number length is 16
  },
  service_provider_image: {
    type: String,
    required: true,
    maxlength: 100,  // Ensures the image URL does not exceed 100 characters
  },
  current_latlong_address: {
    type: String,
    maxlength: 150,  // Ensures the address does not exceed 150 characters
  },
  current_address: {
    type: String,
    maxlength: 200,  // Ensures the address does not exceed 200 characters
  },
  aadhaar_address: {
    type: String,
    maxlength: 200,  // Ensures the Aadhaar address does not exceed 200 characters
  },
  current_latlong: {
    type: String,
    maxlength: 40,  // Ensures the current_latlong does not exceed 40 characters
  },
  current_address_latlong: {
    type: String,
    maxlength: 40,  // Ensures the current_address_latlong does not exceed 40 characters
  },
  aadhaar_address_latlong: {
    type: String,
    maxlength: 40,  // Ensures the aadhaar_address_latlong does not exceed 40 characters
  },
  active_status: {
    type: String,
    enum: ['1', '0'],  // Only allows '1' or '0'
    default: '1',  // Default active status is '1' (active)
  },
  agent_number: {
    type: String,
    required: true,
    maxlength: 10,  // Ensures the agent number does not exceed 10 characters
  },
  panel_login: {
    type: String,
    enum: ['0', '1'],  // Only allows '0' or '1'
  },
  last_panel_login: {
    type: Date,
    default: Date.now,  // Default to current timestamp if not provided
  },
});

const ServiceProvider = mongoose.model('ServiceProvider', ServiceProviderSchema);

module.exports = ServiceProvider;
