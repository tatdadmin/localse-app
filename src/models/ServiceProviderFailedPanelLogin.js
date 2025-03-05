const mongoose = require("mongoose");

const failedLoginSchema = new mongoose.Schema({
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

const ServiceProviderFailedPanelLogin = mongoose.model(
    "service_provider_failed_panel_login",
    failedLoginSchema
);

module.exports = ServiceProviderFailedPanelLogin;
