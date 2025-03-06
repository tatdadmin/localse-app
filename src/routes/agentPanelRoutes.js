const express = require('express');
const { addLead, getAgentInfo, getLeadsByAgentNumber, getRegisteredServiceProviderByAgentNumber, getAllLeadsRegisteredByAgentNumber } = require('../controllers/agentPanelController');
const authenticateAgentJWT = require('../middlewares/agentAuth');

const router = express.Router();


router.post("/add-lead",authenticateAgentJWT, addLead)
router.get("/get-agent-info",authenticateAgentJWT,getAgentInfo)
router.get("/get-leads",authenticateAgentJWT,getLeadsByAgentNumber);
router.get("/get-registered",authenticateAgentJWT,getRegisteredServiceProviderByAgentNumber);
router.get("/get-all-leads-registered",authenticateAgentJWT,getAllLeadsRegisteredByAgentNumber)

module.exports = router;