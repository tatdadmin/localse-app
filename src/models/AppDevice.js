const mongoose = require('mongoose');

const appDeviceSchema = new mongoose.Schema({
  mobile_number: { type: String, required: true, maxlength: 10 },
  add_date: { type: Date, default: Date.now },
  manufacturer: { type: String, default:"" },
  model: { type: String, required: true },
  deviceName: { type: String, required: true },
  systemName: { type: String, required: true },
  systemVersion: { type: String, required: true },
  appVersion: { type: String, required: true },
  buildNumber: { type: String, required: true },
  isTablet: { type: String, default:'' },
  user_app: { type: String, default: '' },
  user_type: { type: String, default: '' },
  action: {type:String, default:''},
});

module.exports = mongoose.model('AppDevice', appDeviceSchema,"app_devices");
