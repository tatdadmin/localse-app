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
      default: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
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
    },
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, // Prevents modification after creation
    },
  },
  {
    timestamps: false, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the model
const ServiceProviderSubscriptionValidation = mongoose.model('ServiceProviderSubscriptionValidation', serviceProviderSubscriptionValidationSchema,"service_provider_subscription_validation");

module.exports = ServiceProviderSubscriptionValidation;
