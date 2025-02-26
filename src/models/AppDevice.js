const mongoose = require('mongoose');

const appDeviceSchema = new mongoose.Schema({
  mobile_number: { type: String, required: true, maxlength: 10 },
  add_date: { type: Date,
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    //  default: Date.now
     },
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
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
  updatedAt:{
    type:Date,
    default:null
  }
}, {
  timestamps: { createdAt: false, updatedAt: false }, // Disable Mongoose's default timestamps
}
);

module.exports = mongoose.model('AppDevice', appDeviceSchema,"app_devices");
