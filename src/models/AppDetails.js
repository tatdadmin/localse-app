const mongoose = require('mongoose');

// Define the schema for app_details
const appDetailsSchema = new mongoose.Schema(
  {
    add_date: {
      type: Date,
      default:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      // default: Date.now, // Default to current timestamp if not provided
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
    upgrade_message_hindi: { type: String, maxlength: 800, default: '' },
    upgrade_message_bengali: { type: String, maxlength: 800, default: '' },
    upgrade_message_urdu: { type: String, maxlength: 800, default: '' },
    upgrade_message_marathi: { type: String, maxlength: 800, default: '' },
    upgrade_message_malayalam: { type: String, maxlength: 800, default: '' },
    upgrade_message_tamil: { type: String, maxlength: 800, default: '' },
    upgrade_message_telugu: { type: String, maxlength: 800, default: '' },
    force_update: {
      type: Number,
      required: true,
      default: 0, // Default to '0'
    },
    createdAt:{
      type:Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    }
  },
  {
    timestamps: false, // Mongoose will automatically manage createdAt and updatedAt fields
  }
);

// Create the model for app_details
const AppDetails = mongoose.model('AppDetails', appDetailsSchema,"app_details");

module.exports = AppDetails;
