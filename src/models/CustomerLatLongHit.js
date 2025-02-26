const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const moment = require("moment-timezone");

const CustomerLatLongHitSchema = new Schema({
  add_date: {
    type: Date,
    default: Date.now
    // () => moment().tz("Asia/Kolkata").toDate(), // Stores IST time
  },
  mobile_number: {
    type: String,
    required: true,
    maxlength: 10, // Assuming Indian mobile number format
  },
  latitude: {
    type: String,
    // required: true,
  },
  longitude: {
    type: String,
    // required: true,
  },
  place_id: {
    type: String,
    // required: true,
  },
  pincode: {
    type: String,
    // required: false,
    maxlength: 10, // Assuming max 10 digits for pincode
  },
  pickup_address: {
    type: String,
    // required: true,
  },
  api_type: {
    type: String,
    // required: false, // Optional field
  },
  api_hit_url: {
    type: String,
    // required: false, // Optional field
  },
});

// Create Model
const CustomerLatLongHit = mongoose.model(
  "CustomerLatLongHit",
  CustomerLatLongHitSchema,
  "customer_lat_long_search_api_hit" // Collection name in MongoDB
);

module.exports = CustomerLatLongHit;
