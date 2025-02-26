const mongoose = require("mongoose");

const ServiceProviderFailedSearchSchema = new mongoose.Schema({
  add_date: {
    type:Date,
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    //  type: String, required: true 
    }, // Stored as "YYYY:MM:DD:HH:mm:ss"
  service_provider_mobile_number: { type: String, required: true },
  service_provider_lat_long_address: { type: String, default: "" },
  search_keyword: { type: String, required: true },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
});

module.exports = mongoose.model(
  "ServiceProviderFailedSearch",
  ServiceProviderFailedSearchSchema,
  "service_provider_failed_search"
);
