const mongoose = require("mongoose");
const moment = require("moment");

const ServiceProviderLatLongSchema = new mongoose.Schema({
  add_date: { 
    type: String, 
    default: () => moment().format("YYYY-MM-DD HH:mm:ss") 
  },
  mobile_number: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  place_id: { type: String, default: "" },
  address: { type: String, default: "" }
});

module.exports = mongoose.model("service_provider_lat_long", ServiceProviderLatLongSchema);
