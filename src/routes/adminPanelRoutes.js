const express = require('express');
const { handleAdminLogin, createNotification, createNotice, getAllNotice, getAllNotification, getAllNotificationByServiceProviderNumberOrServiceType, getAllServiceProvider, deleteNoticeById, deleteNotificationById } = require('../controllers/adminPanelController');
const authenticateAdminJWT = require('../middlewares/adminAuth');
const router = express.Router();


router.post("/login",handleAdminLogin)
router.post("/create-notification",authenticateAdminJWT,createNotification)
router.post("/create-notice",authenticateAdminJWT,createNotice);
router.get("/get-notice",authenticateAdminJWT,getAllNotice);
router.get("/get-all-notification",authenticateAdminJWT,getAllNotification)
router.post("/delete-notice",authenticateAdminJWT,deleteNoticeById);
router.post("/delete-notification",authenticateAdminJWT,deleteNotificationById);
router.get("/get-all-service-provider",authenticateAdminJWT,getAllServiceProvider)
module.exports = router;