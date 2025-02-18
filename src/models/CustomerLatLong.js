const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Customer LatLong Schema
const CustomerLatLongSchema = new Schema({
  add_date: {
    type: Date,
    default: Date.now,  // Default to the current date and time if not provided
  },
  mobile_number: {
    type: String,
    required: true,
    maxlength: 10,  // Ensures the mobile number length does not exceed 10 characters
  },
  latitude: {
    type: String,
    required: true,
    maxlength: 50,  // You can adjust this length as needed
  },
  longitude: {
    type: String,
    required: true,
    maxlength: 50,  // You can adjust this length as needed
  },
  place_id: {
    type: String,
    required: true,
    maxlength: 255,  // You can adjust this length as needed
  },
  address: {
    type: String,
    required: true,
    maxlength: 100,  // You can adjust this length as needed
  },
});

// Model for Customer LatLong
const CustomerLatLong = mongoose.model('CustomerLatLong', CustomerLatLongSchema,"customer_lat_long");

module.exports = CustomerLatLong;
