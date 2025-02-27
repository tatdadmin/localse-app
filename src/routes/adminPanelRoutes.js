const express = require('express');
const { handleAdminLogin, createNotification, createNotice } = require('../controllers/adminPanelController');
const authenticateAdminJWT = require('../middlewares/adminAuth');
const router = express.Router();


router.post("/login",handleAdminLogin)
router.post("/create-notification",authenticateAdminJWT,createNotification)
router.post("/create-notice",authenticateAdminJWT,createNotice);
module.exports = router;