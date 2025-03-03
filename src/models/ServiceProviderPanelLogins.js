const mongoose = require('mongoose');

const serviceProviderPanelLoginSchema = new mongoose.Schema(
  {
    // id: { type: Number, required: true },
    add_date: { type: Date, 
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
        // default: '0000-00-00 00:00:00' 
    }, // You can default it to a valid date string or adjust logic
    service_provider_mobile_number: { type: String, required: true, maxlength: 10 },
    active_status: { type: String, enum: ['1', '0'], default: '1' },
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, // Prevents modification after creation
    },
  },
  { timestamps: false } // No need for automatic timestamps
);

module.exports = mongoose.model('ServiceProviderPanelLogin', serviceProviderPanelLoginSchema,"service_provider_panel_logins");
