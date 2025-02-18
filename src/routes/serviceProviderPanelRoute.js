const express = require("express");
const { hanldeServiceProviderNotice, hanldeServiceProviderNoticeBoardClicks, handleServiceProviderNotification, serviceProviderNotificationVideos, getServiceProviderProfileInfo, serviceProviderPanelLoginStatus, serviceProviderClick, updateServiceProviderNotificationsStatus, handleServiceProviderVideoLibraryClicks, handleServiceProviderPanelLogin, buySubscriptionCheck, serviceProviderBuySubscription } = require("../controllers/serviceProviderPanelController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/service_provider_panel/service_provider_notice",authenticate, hanldeServiceProviderNotice);
router.post("/service_provider_panel/service_provider_notice_board_clicks",authenticate,hanldeServiceProviderNoticeBoardClicks)
router.get("/service_provider_panel/service_provider_notifications",authenticate,handleServiceProviderNotification)
router.get("/service_provider_panel/service_provider_notification_videos_api",authenticate,serviceProviderNotificationVideos);
router.get("/service_provider_panel/service_provider_profile_information_api",authenticate,getServiceProviderProfileInfo)
router.get("/service_provider_panel/service_provider_panel_login_status",authenticate,serviceProviderPanelLoginStatus)
router.get("/service_provider_panel/services_provider_clicks_api",authenticate,serviceProviderClick)

router.post("/service_provider_panel/update_services_provider_notifications_status_api",authenticate,updateServiceProviderNotificationsStatus)
router.post("/service_provider_panel/serivce_provider_video_libriary_clicks",authenticate,handleServiceProviderVideoLibraryClicks)

// 12 feb
router.post("/service_provider_panel/service_provider_panel_login",authenticate,handleServiceProviderPanelLogin);
router.get("/service_provider_panel/buy_subscription_check_api",authenticate,buySubscriptionCheck);
router.post("/service_provider_panel/service_provider_buy_subscription_api",authenticate,serviceProviderBuySubscription)
module.exports = router;
