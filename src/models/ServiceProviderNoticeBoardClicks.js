const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for service_provider_notice_board_clicks
const serviceProviderNoticeBoardClicksSchema = new Schema(
  {
    service_provider_mobile_number: { type: String, required: true, maxlength: 20 },
    noticeBoardId: { type: String, required: true },
    addDate: { type: Date, 
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      // default: Date.now 
    }, 
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, // Prevents modification after creation
    },
  },
  {
    collection: 'service_provider_notice_board_clicks', // MongoDB collection name
    timestamps: false // No automatic createdAt / updatedAt fields
  }
);

// Create the model
const ServiceProviderNoticeBoardClicks = mongoose.model('ServiceProviderNoticeBoardClicks', serviceProviderNoticeBoardClicksSchema);

module.exports = ServiceProviderNoticeBoardClicks;
