// routes for customer app
const express = require('express');
const router = express.Router();

const authenticateJWT = require('../middlewares/customerAuth.js');
const { handleVerifyOtp, saveUserAppDeviceInfo, handleLoginAttempt, saveFCMToken, getServiceTypeFromServiceProvide, handleCustomerCurrentAddress, generateJWTTokenWithRefreshToken, filterSearchServiceTypeApi, getServiceProviderListBasedOnServicesType, insertRatingToServiceProvider, showRatingModel, serviceProviderDelete, HandleStoreClick, getAppVersionInfo, getCustomerlatlong, customerLatLongHit, getRecentClickedServiceProvider, HandleRemoveRecentServiceProvider } = require('../controllers/customerAppContoller.js');
const profileController = require('../controllers/customerProfileController.js');

// Define the POST route for /api/mobileOTP using the sendOTP controller function
router.post('/login/login-otp', handleLoginAttempt);
router.post('/login/verify-otp-login',handleVerifyOtp);
router.post('/login/save-fcm-token-api',authenticateJWT,saveFCMToken)
router.post('/login/save-user-device-info',authenticateJWT,saveUserAppDeviceInfo)
router.get('/login/get-customer-latlong-api',authenticateJWT,getCustomerlatlong)
// need to work upon
router.post('/login/refresh_token',generateJWTTokenWithRefreshToken) 

router.post('/login/save-current-location-api',authenticateJWT,handleCustomerCurrentAddress)
router.get('/home/get_service_type-api',authenticateJWT,getServiceTypeFromServiceProvide)
router.get('/home/filter_service_type_api',authenticateJWT,filterSearchServiceTypeApi)//for searching service type


router.get('/service_provider_listing/get_service_provider-listing-api',authenticateJWT,getServiceProviderListBasedOnServicesType);

router.post('/service_provider_listing/insert-rating-api',authenticateJWT,insertRatingToServiceProvider)
router.get('/service_provider_listing/rating_modal_content_api',authenticateJWT,showRatingModel)
router.post('/service_provider_listing/service-provider-deleted',authenticateJWT,serviceProviderDelete)
router.post('/service_provider_listing/store_click_api',authenticateJWT,HandleStoreClick)
router.post('/authentication/get-app-version-info',authenticateJWT,getAppVersionInfo)
router.post('/home/customer-lat-long-hit',authenticateJWT,customerLatLongHit)
router.put('/profile-update', authenticateJWT,profileController.uploadProfileImage, profileController.updateProfile)
router.get("/get-profile", authenticateJWT, profileController.getCustomerProfile);
router.get('/service_provider_listing/get-recent-service-provider',authenticateJWT,getRecentClickedServiceProvider);
router.post("/service_provider_listing/remove_service_provider_from_recent",authenticateJWT,HandleRemoveRecentServiceProvider)

module.exports = router;
