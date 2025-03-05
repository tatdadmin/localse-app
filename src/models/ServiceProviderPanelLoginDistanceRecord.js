const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema({
    service_provider_mobile_number: { type: String, default: "" },
    panel_login_distance_from_aadhaar: { type: String, default: "" },
    aadhaar_lat_long: { type: String, default: "" },
    current_lat_long: { type: String, default: "" },
    createdAt: {
        type: Date,
        default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
        immutable: true, // Prevents modification after creation
      },
});

const ServiceProviderPanelLoginDistanceRecord = mongoose.model(
    "service_provider_panel_login_distance_record",
    serviceProviderSchema
);

module.exports = ServiceProviderPanelLoginDistanceRecord;
