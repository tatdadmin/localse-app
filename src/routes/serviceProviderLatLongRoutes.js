const express = require('express');
const router = express.Router();
const serviceProviderLatLong = require('../controllers/service_provider_lat_longController');

router.post('/login/save-current-location-api', serviceProviderLatLong.createServiceProviderLatLong);

module.exports = router;