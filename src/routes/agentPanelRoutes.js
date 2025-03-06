const express = require('express');
const { addLead, getAgentInfo, getLeadsByAgentNumber, getRegisteredServiceProviderByAgentNumber, getAllLeadsRegisteredByAgentNumber, serviceProviderCreateOTP, serviceProviderVerifyOTP } = require('../controllers/agentPanelController');
const authenticateAgentJWT = require('../middlewares/agentAuth');

const router = express.Router();


router.post("/add-lead",authenticateAgentJWT, addLead)
router.get("/get-agent-info",authenticateAgentJWT,getAgentInfo)
router.get("/get-leads",authenticateAgentJWT,getLeadsByAgentNumber);
router.get("/get-registered",authenticateAgentJWT,getRegisteredServiceProviderByAgentNumber);
router.get("/get-all-leads-registered",authenticateAgentJWT,getAllLeadsRegisteredByAgentNumber)

//for registring new service provider through agent_panel
router.post("/service-provider/create-otp",authenticateAgentJWT,serviceProviderCreateOTP);
router.post("/service-provider/verify-otp",authenticateAgentJWT,serviceProviderVerifyOTP)

module.exports = router;