
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const appDeviceRoutes = require("./routes/appDeviceRoutes");
const serviceProviderLatLongRoutes = require("./routes/serviceProviderLatLongRoutes");
const serviceProviderServiceRoutes = require("./routes/seriveProviderServiceRoutes");
const aadharOpt = require("./routes/aadhaarRoutes")
const customerAppRoutes = require("./routes/customerAppRoute"); // Import routes from mobileOTP.js
const serviceProviderPanelRoute = require("./routes/serviceProviderPanelRoute");
const adminPanelRoute= require("./routes/adminPanelRoutes");
const agnentPanelRoute= require("./routes/agentPanelRoutes");


const app = express();
const PORT = process.env.PORT || 5000;




// Allow requests from specific origins
// const allowedOrigins = ["http://localhost:3000", "http://localhost:8081"];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // If using cookies or authentication
//   })
// );


app.use(
  cors({
    origin: "*", // Allows all origins
    credentials: true,
  })
);


const bodyParser = require('body-parser');
// Connect to MongoDB
connectDB();
const path = require('path');
const runServiceProviderCron = require("./cronJob/serviceProviderCron");
// Middleware
app.use(express.json());
// app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// app.use('/uploads', express.static('uploads')); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//for Customer api routes
app.use('/api/customer', customerAppRoutes);
app.use('/api/admin_panel',adminPanelRoute);
app.use('/api/service_provider/agent_panel',agnentPanelRoute);

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

runServiceProviderCron();
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on :${PORT}`);
});
