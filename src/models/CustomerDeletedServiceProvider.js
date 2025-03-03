const mongoose = require('mongoose');

// Define the schema for customer_deleted_service_provider
const customerDeletedServiceProviderSchema = new mongoose.Schema(
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
      immutable: true, // Prevents modification after creation
    },
  },
  {
    timestamps: false, // Mongoose will automatically manage createdAt and updatedAt fields
  }
);

// Create the model for customer_deleted_service_provider
const CustomerDeletedServiceProvider = mongoose.model(
  'CustomerDeletedServiceProvider',
  customerDeletedServiceProviderSchema,
  "customer_deleted_service_provider"
);

module.exports = CustomerDeletedServiceProvider;
