const mongoose = require('mongoose');

const serviceProviderSubscriptionValidationSchema = new mongoose.Schema(
  {
    service_provider_mobile_number: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10
    },
    add_date: {
      type: Date,
      default: Date.now
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    order_id: {
      type: String,
    //   required: true,
      maxlength: 200
    },
    payment_id: {
      type: String,
    //   required: true,
      maxlength: 200
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the model
const ServiceProviderSubscriptionValidation = mongoose.model('ServiceProviderSubscriptionValidation', serviceProviderSubscriptionValidationSchema,"service_provider_subscription_validation");

module.exports = ServiceProviderSubscriptionValidation;
