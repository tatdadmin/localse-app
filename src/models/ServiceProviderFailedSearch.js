const mongoose = require("mongoose");

const ServiceProviderFailedSearchSchema = new mongoose.Schema({
  add_date: { type: String, required: true }, // Stored as "YYYY:MM:DD:HH:mm:ss"
  service_provider_mobile_number: { type: String, required: true },
  service_provider_lat_long_address: { type: String, default: "" },
  search_keyword: { type: String, required: true },
});

module.exports = mongoose.model(
  "ServiceProviderFailedSearch",
  ServiceProviderFailedSearchSchema
);
