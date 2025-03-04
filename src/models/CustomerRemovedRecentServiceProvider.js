const mongoose = require('mongoose');

const customerRemovedRecentServiceProvider = new mongoose.Schema(
  {
    add_date: {
      type: Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      // default: Date.now, // Default to current timestamp if not provided
    },
    mobile_number: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      trim: true, // Ensures no extra spaces are stored
    },
    service_provider_mobile_number: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      trim: true, // Ensures no extra spaces are stored
    },
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, 
    },
  },
  {
    timestamps: false, // Mongoose will automatically manage createdAt and updatedAt fields
  }
);
const CustomerRemovedRecentServiceProvider = mongoose.model(
  'CustomerRemovedRecentServiceProvider',
  customerRemovedRecentServiceProvider,
  "customer_removed_recent_service_provider"
);

module.exports = CustomerRemovedRecentServiceProvider;
