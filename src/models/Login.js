const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  page_url: {
    type: String,
    // required: true,
    default: '',
    maxlength: 30
  },
  mobile_number: {
    type: String,
    required: true,
    default: '',
    match: /^[0-9]{10}$/ // Ensures only valid 10-digit numbers
  },
  login_time: {
    type: Date,
    required: true,
    default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    // default: new Date(0) // Equivalent to 1970-01-01T00:00:00Z
  },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
});

const Login = mongoose.model('Login', loginSchema,"login");

module.exports = Login;
