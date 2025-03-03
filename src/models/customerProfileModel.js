const mongoose = require("mongoose");

const customerProfileSchema = new mongoose.Schema({
  mobile_no: { type: String, unique: true, default: "" },
  first_name: { type: String,default: "" },
  last_name: { type: String,default: ""},
  email: { type: String,default: ""},
  image: { type: String, default: "" }, // S3 URL
  permanent_address: { type: String,default: ""},
  title: { type: String, default: ""},
  createdAt: {
    type: Date,
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    immutable: true, // Prevents modification after creation
  },
  updatedAt: { type: Date, default: null},
});

module.exports = mongoose.model("CustomerProfile", customerProfileSchema, "customer_profile");
