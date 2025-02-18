const express = require('express');
const router = express.Router();
const appDeviceController = require('../controllers/appDeviceController');

router.post('/login/save-user-device-info', appDeviceController.createDevice);
router.get('/get-all', appDeviceController.getDevices);
router.get('/get/:id', appDeviceController.getDeviceById);
router.put('/update/:id', appDeviceController.updateDevice);
router.delete('/delete/:id', appDeviceController.deleteDevice);

module.exports = router;
