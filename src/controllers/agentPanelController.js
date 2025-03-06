const AgentLead = require("../models/AgentLeads");
const serviceProviderModel = require("../models/serviceProviderModel");

async function addLead(req,res){
    try {
        const agentMobileNumber= req.user.mobile;
        const {service_provider_mobile_number}= req.body;
        if(!service_provider_mobile_number){
            return res.status(400).json({
                status_code:400,
                message:"please provider service_provider_mobile_number to add as Lead"
            })
        }
        const existingAgent= await serviceProviderModel.findOne({service_provider_mobile_number:agentMobileNumber});

        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:"Agent With service_provider_mobile_number doesnot exist"
            })
        }

        const existingServiceProvider= await serviceProviderModel.findOne({service_provider_mobile_number:service_provider_mobile_number});
        if(existingServiceProvider){
            return res.status(400).json({
                status_code:400,
                message:"service provider with given service_provider_mobile_number already Registered, You Cant Add as Lead"
            })
        }
        const existingLead = await AgentLead.findOne({
            service_provider_mobile_number: service_provider_mobile_number,
            status_id: { $in: ["0", "1"] }
        });
        if(existingLead){
            if(existingLead.agent_number == agentMobileNumber){
               return res.status(400).json({
                status_code:400,
                message:"You have already Added this service_provider_mobile_number as Lead"
               })
            }else{
                return res.status(400).json({
                    status_code:400,
                    message:"Some Already made this service_provider_mobile_number as Lead/Registered,You Cant Add"
                })
            }
        }

        const newAgentLeadData= new AgentLead({
            agent_name:existingAgent.service_provider_name,
            agent_number:existingAgent.service_provider_mobile_number,
            service_provider_mobile_number:service_provider_mobile_number,
            status: "Lead",
            status_id:"0"
        });
        await newAgentLeadData.save();
        return res.status(200).json({
            status_code:200,
            message:`service_provider with mobileNumber: ${service_provider_mobile_number} has been added by agentNumber: ${existingAgent.service_provider_mobile_number}`
        })
    } catch (error) {
        console.error("Error In Adding Agent Lead", error);
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
        }
}

async function getAgentInfo(req,res){
    try {
        const agentMobileNumber= req.user.mobile;
        const existingAgent= await serviceProviderModel.findOne({
            service_provider_mobile_number:agentMobileNumber
        });
        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:"Agent with mobile_number doesnot exist"
            })
        };
        const agentLeadsData= await AgentLead.find({
            agent_number:agentMobileNumber
        });

        if(agentLeadsData.length == 0){
            return res.status(200).json({
                status_code:200,
                message:"Data for Agent Info Retrieved Successfully",
                data:{
                    agent_name:existingAgent.service_provider_name,
                    agent_image:existingAgent.service_provider_image,
                    agent_address: existingAgent.aadhaar_address,
                    agent_rating: existingAgent.agent_rating ? existingAgent.agent_rating : "4.0",
                    leads_added:"0",
                    leads_registered:"0",
                }
            })
        }else{
            let agentLeadsAddedCount = agentLeadsData.filter(entry => entry.status === 'Lead').length;
            let agentLeadsRegisteredCount = agentLeadsData.filter(entry => entry.status === 'Registered').length;

            return res.status(200).json({
                status_code:200,
                message:"Data for Agent Info Retrieved Successfully",
                data:{
                    agent_name:existingAgent.service_provider_name,
                    agent_image:existingAgent.service_provider_image,
                    agent_address: existingAgent.aadhaar_address,
                    agent_rating: existingAgent.agent_rating ? existingAgent.agent_rating : "4.0",
                    leads_added:agentLeadsAddedCount,
                    leads_registered:agentLeadsRegisteredCount,
                }
            })
        }
    } catch (error) {
        console.error("Error In Getting Agent Info", error);
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

async function getLeadsByAgentNumber(req,res){
    try {
        const agentMobileNumber= req.user.mobile;
        const data_limit= req.query.data_limit;

        const existingAgent= await serviceProviderModel.findOne({
            service_provider_mobile_number:agentMobileNumber
        });
        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:"Agent with mobile_number doesnot exist"
            })
        };

        const agentLeads = await AgentLead.find({agent_number:agentMobileNumber, status_id: { $in: ["0"] }})
                            .sort({ add_date: -1 }) 
                            .limit(data_limit > 0 ? data_limit : 0);
        
            return res.status(200).json({
                status_code:200,
                message:"All Data For Leads Retrieved Successfully",
                data:agentLeads
            })
    } catch (error) {
        console.error("Error In Getting All Leads", error);
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

async function getRegisteredServiceProviderByAgentNumber(req,res){
    try {
        const agentMobileNumber= req.user.mobile;
        const data_limit= req.query.data_limit;

        const existingAgent= await serviceProviderModel.findOne({
            service_provider_mobile_number:agentMobileNumber
        });
        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:"Agent with mobile_number doesnot exist"
            })
        };

        const agentLeads = await AgentLead.find({agent_number:agentMobileNumber, status_id: { $in: ["1"] }})
                            .sort({ add_date: -1 }) 
                            .limit(data_limit > 0 ? data_limit : 0);
        
            return res.status(200).json({
                status_code:200,
                message:"All For Registered Service Providers Retrieved Successfully",
                data:agentLeads
            })
    } catch (error) {
        console.error("Error In Getting Registered", error);
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

async function getAllLeadsRegisteredByAgentNumber(req,res){
    try {
        const agentMobileNumber= req.user.mobile;
        const data_limit= req.query.data_limit;

        const existingAgent= await serviceProviderModel.findOne({
            service_provider_mobile_number:agentMobileNumber
        });
        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:"Agent with mobile_number doesnot exist"
            })
        };

        const agentLeads = await AgentLead.find({agent_number:agentMobileNumber, status_id: { $in: ["0","1"] }})
                            .sort({ add_date: -1 }) 
                            .limit(data_limit > 0 ? data_limit : 0);
        
            return res.status(200).json({
                status_code:200,
                message:"All Data Retrieved Successfully",
                data:agentLeads
            })
    } catch (error) {
        console.error("Error In Getting All Leads & Registered", error);
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });  
    }
}

module.exports= {addLead,getAgentInfo,getLeadsByAgentNumber,getRegisteredServiceProviderByAgentNumber,getAllLeadsRegisteredByAgentNumber};