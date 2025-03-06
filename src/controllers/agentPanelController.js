const AgentLead = require("../models/AgentLeads");
const AppLoginAttempt = require("../models/AppLoginAttempt");
const serviceProviderModel = require("../models/serviceProviderModel");
const { sendSms } = require("../utils/sendSms");

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
                message:`You have already added this ${service_provider_mobile_number} as Lead`,
               })
            }else{
                return res.status(400).json({
                    status_code:400,
                    message: `This Number: ${service_provider_mobile_number} already used By some one`,
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
            message: `Service Provider : ${service_provider_mobile_number} added in Lead Successfully`,
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
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
  }

async function serviceProviderCreateOTP(req,res){
        const agentMobileNumber = req.user.mobile;
        const existingAgent = await serviceProviderModel.findOne({
            service_provider_mobile_number:agentMobileNumber
        });
        if(!existingAgent){
            return res.status(400).json({
                status_code:400,
                message:" Service Provider doesnot Exist with JWT"
            })
        }
        const { mobile, current_app_version, deviceOS, IpAddress } = req.body;
      
        if (!mobile) {
          return res
            .status(400)
            .json({ status_code: "400", message: "Mobile number is required" });
        }
      
        const otp = generateOTP(); // Generate OTP
        const expiresAt = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        const expires_at =  expiresAt// moment().utc().add(10, "minutes").toDate(); //.format('YYYY-MM-DD HH:mm:ss'); // OTP valid for 10 minutes
        const current_time =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000); //.format('YYYY-MM-DD HH:mm:ss');
        const user_type = "Service Provider";
        const db_user = "Service Provider"; // This can be dynamic if needed
      
        try {
          // Check if there's an existing OTP for the mobile number
          const existingLoginAttempt = await AppLoginAttempt.findOne({
            mobile,
            expires_at: { $gt: current_time }, // Check if OTP is still valid
            user_type,
          }).sort({ created_at: -1 });
      
          let flag = false;
      
          if (existingLoginAttempt) {
            existingLoginAttempt.otp = otp;
            existingLoginAttempt.expires_at = expires_at;
            existingLoginAttempt.deviceOS = deviceOS;
            existingLoginAttempt.app_version = current_app_version;
      
            await existingLoginAttempt.save();
            flag = true;
          } else {
            // No valid OTP exists, insert a new record
            const newLoginAttempt = new AppLoginAttempt({
              created_at: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
              mobile,
              otp,
              expires_at,
              IpAddress,
              user_type,
              db_user,
              deviceOS,
              app_version: current_app_version,
            });
            await newLoginAttempt.save();
            flag = true;
          }
      
          if (flag) {
            await sendSms(mobile, otp);
      
            res
              .status(200)
              .json({
                status_code: "200",
                message: "OTP sent successfully",
                otp: otp,
              });
          } else {
            res
              .status(500)
              .json({ status_code: "500", message: "Failed to generate OTP" });
          }
        } catch (err) {
          console.error("Error In Creating OTP", err);
          res
            .status(500)
            .json({ status_code: "500", message: "Internal Server Error" });
        }
      
}

async function serviceProviderVerifyOTP(req,res){
        const { mobile, otp, deviceOS, current_app_version } = req.body;
        const user_type = "Service Provider";
        const db_user= "Service Provider";
        const expires_at =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)// moment().utc().toDate();
        const currentTime =  new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)//moment().utc().startOf("second"); // Strip milliseconds from current time
      
        if (!mobile || !otp) {
          return res
            .status(400)
            .json({ message: "Mobile number and OTP are required" });
        }
      
        try {
          const loginAttempt = await AppLoginAttempt.findOne({
            mobile: mobile,
            otp,
            user_type,
            db_user,
            expires_at: { $gt: currentTime },
          }).sort({ created_at: -1 });
      
          if (!loginAttempt) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
          }
          await AppLoginAttempt.updateOne(
            { _id: loginAttempt._id },
            { login_status: "1" }
          );

          return res.status(200).json({
            status_code: 200,
            message: "OTP verified successfully",
          });
        } catch (error) {
          console.error("Error during OTP verification:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
}

module.exports= {addLead,getAgentInfo,getLeadsByAgentNumber,getRegisteredServiceProviderByAgentNumber,getAllLeadsRegisteredByAgentNumber,serviceProviderCreateOTP,serviceProviderVerifyOTP};