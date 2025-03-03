const CustomerProfile = require("../models/customerProfileModel");
const upload = require("../config/multerConfig");

exports.uploadProfileImage = upload.single("image");

exports.updateProfile = async (req, res) => {
  try {
    const mobile_no = req.user.mobile_number;

    if (!mobile_no) {
      return res.status(400).json({ message: "Invalid JWT token" });
    }

    const customerProfile = await CustomerProfile.findOne({ mobile_no });

    if (!customerProfile) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const { first_name, last_name, email, permanen_address, title } = req.body;
    const imageUrl = req.file ? req.file.location : customerProfile.image;

    customerProfile.first_name = first_name || customerProfile.first_name;
    customerProfile.last_name = last_name || customerProfile.last_name;
    customerProfile.email = email || customerProfile.email;
    customerProfile.image = imageUrl;
    customerProfile.permanen_address =
      permanen_address || customerProfile.permanen_address;
    customerProfile.title = title || customerProfile.title;
    customerProfile.updatedAt = new Date(
      new Date().getTime() + 5.5 * 60 * 60 * 1000
    );

    await customerProfile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      status_code: 200,
      profile: customerProfile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const mobile_no = req.user.mobile_number;

    if (!mobile_no) {
      return res.status(400).json({ message: "Invalid JWT token" });
    }

    const customerProfile = await CustomerProfile.findOne({ mobile_no });

    if (!customerProfile) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    res.status(200).json({
      message: "Customer profile retrieved successfully",
      status_code: 200,
      profile: customerProfile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
