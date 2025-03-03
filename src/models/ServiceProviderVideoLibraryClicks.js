const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for service_provider_video_library_clicks
const serviceProviderVideoLibraryClicksSchema = new Schema(
  {
    service_provider_mobile_number: {
      type: String,
      required: true,
      maxlength: 20, // Maximum length of the mobile number
    },
    video_library_id: {
      type: Number,
      required: true, // The ID of the video in the video library
    },
    add_date: {
      type: Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      // default: Date.now, // Default to the current timestamp when a new entry is created
    },
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, // Prevents modification after creation
    },
  },
  {
    collection: 'service_provider_video_library_clicks', // MongoDB collection name
    timestamps: false, // Disable automatic createdAt and updatedAt fields
  }
);

// Create the model for service_provider_video_library_clicks
const ServiceProviderVideoLibraryClicks = mongoose.model(
  'ServiceProviderVideoLibraryClicks',
  serviceProviderVideoLibraryClicksSchema
);

module.exports = ServiceProviderVideoLibraryClicks;
