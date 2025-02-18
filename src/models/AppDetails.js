const mongoose = require('mongoose');

// Define the schema for app_details
const appDetailsSchema = new mongoose.Schema(
  {
    add_date: {
      type: Date,
      default: Date.now, // Default to current timestamp if not provided
    },
    app_url: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true, // Ensures no extra spaces are stored
    },
    app_type: {
      type: String,
      required: true,
      maxlength: 30,
    },
    user_type: {
      type: String,
      required: true,
      maxlength: 20,
      default: '',
    },
    version: {
      type: String,
      required: true,
      maxlength: 30,
      default: '',
    },
    status: {
      type: Number,
      required: true,
      default: 0, // Default to '0'
    },
    upgrade_message: {
      type: String,
      required: true,
      maxlength: 800,
      default: '',
    },
    force_update: {
      type: Number,
      required: true,
      default: 0, // Default to '0'
    },
  },
  {
    timestamps: true, // Mongoose will automatically manage createdAt and updatedAt fields
  }
);

// Create the model for app_details
const AppDetails = mongoose.model('AppDetails', appDetailsSchema,"app_details");

module.exports = AppDetails;
