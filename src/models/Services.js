const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    // id: { type: Number, required: true },
    add_date: { type: Date, default: null }, // Timestamp field, defaults to null
    service_type: { type: String, required: true, default: '' },
    service_type_synonym: { type: String, required: true, default: '' },
    service_category: { type: String, required: true, default: '' },
    services_added_by: { type: String, required: true, default: '' },
    service_active_status: { type: String, enum: ['1', '0'], default: '1' }
  },
  { timestamps: false } // No need for automatic timestamps as your SQL doesn't have them
);

module.exports = mongoose.model('Service', serviceSchema,"services");
