const mongoose = require("mongoose");
const moment = require("moment");

const ServiceProviderLatLongSchema = new mongoose.Schema({
  add_date: { 
    type:Date,
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    // type: String, 
    // default: () => moment().format("YYYY-MM-DD HH:mm:ss") 
  },
  mobile_number: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  place_id: { type: String, default: "" },
  address: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
});

module.exports = mongoose.model("service_provider_lat_long", ServiceProviderLatLongSchema);
