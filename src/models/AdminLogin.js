const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for admin_login
const adminLoginSchema = new Schema(
  {
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 10,
      maxlength: 10,
      match: /^[0-9]{10}$/, // Ensures only 10-digit numbers are allowed
    },
    pin: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 6, // Assuming PIN should be between 4 to 6 digits
    },
    add_date: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000), // Setting default time in IST
    },
    status:{
        type:String,
        default:"1"
    }
  },
  {
    collection: 'admin_login', // MongoDB collection name
    timestamps: false, // Avoid automatic createdAt and updatedAt fields
  }
);

// Create the model
const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema);

module.exports = AdminLogin;
