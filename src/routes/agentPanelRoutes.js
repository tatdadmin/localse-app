const express = require('express');
const { addLead, getAgentInfo, getLeadsByAgentNumber, getRegisteredServiceProviderByAgentNumber, getAllLeadsRegisteredByAgentNumber, serviceProviderCreateOTP, serviceProviderVerifyOTP, sendAadhaarOTPServiceProvider, verifyAadhaarOTPServiceProvider, uploadImageToAWS, serviceProviderRegistrationByAgentPanel, addServiceProviderLatLongByAgentPanel } = require('../controllers/agentPanelController');
const authenticateAgentJWT = require('../middlewares/agentAuth');

const router = express.Router();


router.post("/add-lead",authenticateAgentJWT, addLead)
router.get("/get-agent-info",authenticateAgentJWT,getAgentInfo)
router.get("/get-leads",authenticateAgentJWT,getLeadsByAgentNumber);
router.get("/get-registered",authenticateAgentJWT,getRegisteredServiceProviderByAgentNumber);
router.get("/get-all-leads-registered",authenticateAgentJWT,getAllLeadsRegisteredByAgentNumber)

//for registring new service provider through agent_panel
router.post("/service-provider/create-otp",authenticateAgentJWT,serviceProviderCreateOTP);
router.post("/service-provider/verify-otp",authenticateAgentJWT,serviceProviderVerifyOTP);
router.post("/service-provider/save-lat-long",authenticateAgentJWT,addServiceProviderLatLongByAgentPanel)
router.post("/send-otp-aadhaar",authenticateAgentJWT,sendAadhaarOTPServiceProvider);
router.post("/verify-otp-aadhaar",authenticateAgentJWT,verifyAadhaarOTPServiceProvider)
router.post("/registration-service-provider",authenticateAgentJWT,uploadImageToAWS,serviceProviderRegistrationByAgentPanel)

module.exports = router;