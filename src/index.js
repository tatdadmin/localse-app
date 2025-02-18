
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const appDeviceRoutes = require("./routes/appDeviceRoutes");
const serviceProviderLatLongRoutes = require("./routes/serviceProviderLatLongRoutes");
const serviceProviderServiceRoutes = require("./routes/seriveProviderServiceRoutes");
const aadharOpt = require("./routes/aadhaarRoutes")
const customerAppRoutes = require("./routes/customerAppRoute"); // Import routes from mobileOTP.js
const serviceProviderPanelRoute = require("./routes/serviceProviderPanelRoute");


const app = express();
const PORT = process.env.PORT || 5000;


const bodyParser = require('body-parser');
// Connect to MongoDB
connectDB();
const path = require('path');
// Middleware
app.use(express.json());
// app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// app.use('/uploads', express.static('uploads')); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//for Customer api routes
app.use('/api/customer', customerAppRoutes);

//for service provider routes
app.use("/api/service_provider",authRoutes);
app.use("/api/service_provider",serviceProviderRoutes);
app.use("/api/service_provider",appDeviceRoutes)
app.use("/api/service_provider", serviceProviderLatLongRoutes )
app.use("/api/service_provider", serviceProviderServiceRoutes)
app.use("/api/service_provider/registration/",aadharOpt)

app.use("/api/service_provider", serviceProviderPanelRoute )

app.get("/", (req, res) => {
  res.send("Welcome to on Local Se Home Page");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on :${PORT}`);
});
