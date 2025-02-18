const mongoose = require('mongoose');

const serviceProviderPanelLoginSchema = new mongoose.Schema(
  {
    // id: { type: Number, required: true },
    add_date: { type: Date, 
        // default: '0000-00-00 00:00:00' 
    }, // You can default it to a valid date string or adjust logic
    service_provider_mobile_number: { type: String, required: true, maxlength: 10 },
    active_status: { type: String, enum: ['1', '0'], default: '1' }
  },
  { timestamps: false } // No need for automatic timestamps
);

module.exports = mongoose.model('ServiceProviderPanelLogin', serviceProviderPanelLoginSchema,"service_provider_panel_logins");
