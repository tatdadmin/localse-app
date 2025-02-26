const express = require('express');
const { handleAdminLogin, createNotification } = require('../controllers/adminPanelController');
const authenticateAdminJWT = require('../middlewares/adminAuth');
const router = express.Router();


router.post("/login",handleAdminLogin)
router.post("/create-notification",authenticateAdminJWT,createNotification)
module.exports = router;