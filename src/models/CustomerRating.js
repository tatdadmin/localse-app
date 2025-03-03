const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for customer_ratings
const customerRatingsSchema = new Schema({
  customer_number: {
    type: String,
    required: true,
    minlength: 1,   // Minimum length of 1
    maxlength: 10,  // Maximum length of 10
    default: ''
  },
  service_provider_number: {
    type: String,
    required: true,
    minlength: 1,   // Minimum length of 1
    maxlength: 10,  // Maximum length of 10
    default: ''
  },
  rating: {
    type: Number,
    min: 1,        // Minimum value of 1
    max: 5,        // Maximum value of 5
    default: 4.5   // Default rating value
  },
  remarks: {
    type: String,  // Text fields can be a String in MongoDB
    default: ''
  },
  add_date: {
    type: Date,
    required: true,
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    // default: Date.now  // Will default to current date if not specified
  },
  update_date: {
    type: Date,
    default: null  // Set to null if no update date is provided
  },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
}, {
  timestamps: false  // No automatic `createdAt` / `updatedAt` fields in MongoDB
});

// Create a model from the schema
const CustomerRating = mongoose.model('CustomerRating', customerRatingsSchema,"customer_ratings");

module.exports = CustomerRating;
