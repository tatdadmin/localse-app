const AgentLead = require("../models/AgentLeads");
const AppLoginAttempt = require("../models/AppLoginAttempt");
const serviceProviderModel = require("../models/serviceProviderModel");
const { sendSms } = require("../utils/sendSms");
require("dotenv").config();
const moment = require("moment");
const axios = require("axios");
const AadhaarVerificationAttempt = require("../models/ZAadharVerificationAttempt")

const AadharVerification = require("../models/serviceProviderAadharVerification");
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

async function sendAadhaarOTPServiceProvider(req,res){
    try {
        const {
          service_provider_mobile_number,
          service_type,
          service_provider_manual_address,
          service_provider_aadhar_number,
          service_provider_image,
        } = req.body;
        if (!service_provider_aadhar_number) {
          return res.status(400).json({
            success: false,
            status_code: 400,
            message: "Aadhaar number is required",
          });
        }
    
        // Check the last Aadhaar verification attempt for cooldown logic
        const lastAttempt = await AadhaarVerificationAttempt.findOne({
          mobile_number: service_provider_mobile_number,
          aadhaar_number: service_provider_aadhar_number,
        }).sort({ _id: -1 });
    
        const currentTime = moment();
        if (
          lastAttempt &&
          moment(lastAttempt.end_date, "YYYY:MM:DD:HH:mm:ss").isAfter(currentTime)
        ) {
          return res.status(200).json({
            success: false,
            status_code: 200,
            msg_type: "error",
            message: `Your previous attempt to verify Aadhaar was unsuccessful. You can try again at ${moment(
              lastAttempt.end_date,
              "YYYY:MM:DD:HH:mm:ss"
            ).format("hh:mm A")}.`,
          });
        }
    
        // Call the external API to generate Aadhaar OTP
        const otpResponse = await axios.post(
          "https://kyc-api.surepass.io/api/v1/aadhaar-v2/generate-otp",
          {
            id_number: service_provider_aadhar_number,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.AADHAAR_API_KEY}`,
            },
          }
        );
    
        const responseData = otpResponse.data;
    
        if (
          responseData.status_code === 200 &&
          responseData.message === "OTP Sent." &&
          responseData.success === true || responseData.success === '1'
        ) {
          
        // Generate timestamp for the new attempt
          const start_date = moment().format("YYYY:MM:DD:HH:mm:ss");
          const end_date = moment().add(5, "minutes").format("YYYY:MM:DD:HH:mm:ss");
    
          // Save the new Aadhaar verification attempt with cooldown period
          const newAttempt = new AadhaarVerificationAttempt({
            mobile_number: service_provider_mobile_number,
            aadhaar_number: service_provider_aadhar_number,
            start_date: start_date,
            end_date: end_date,
          });
          await newAttempt.save();
    
          return res.status(200).json({
            success: true,
            status_code: 200,
            message: "OTP sent successfully",
            aadhaar_client_id: responseData.data.client_id,
          });
        } else {
          return res.status(200).json({
            success: false,
            status_code: 200,
            msg_type: "error",
            message:
              "आपका दिए हुए आधार नंबर पर आपका मोबाइल नंबर रजिस्टर नहीं है, कृपया नजदीकी आधार सेंटर पर जाकर अपने आधार नंबर पर अपना मोबाइल नंबर जोड़वा लें।",
          });
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          status_code: 500,
          message: "Internal server error",
          error: error.message,
        });
      }
}

async function verifyAadhaarOTPServiceProvider(req,res){
    try{
  const { otp, aadhaar_client_id,service_provider_mobile_number } = req.body;

    if (!otp || !aadhaar_client_id || !service_provider_mobile_number) {
      return res
        .status(400)
        .json({
          status_code: 400,
          message: "Aadhaar Client ID or OTP is missing",
        });
    }
    const mobile_number = service_provider_mobile_number; // Get the mobile number from the token

    // Call the external API for OTP verification
    const response = await axios.post(
      "https://kyc-api.surepass.io/api/v1/aadhaar-v2/submit-otp",
      {
        client_id: aadhaar_client_id,
        otp: otp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AADHAAR_API_KEY}`,
        },
      }
    );

    const responseData = response.data;

    if (responseData.status_code !== 200 || !responseData.success) {
      return res.status(400).json({ status_code: 400, message: "Invalid OTP" });
    }

    const existingAadhaarVerification = await AadharVerification.findOne({
      mobile_number: mobile_number,
      aadhaar_number: responseData.data.aadhaar_number,
    });

    if (existingAadhaarVerification) {
      return res.status(200).json({
        status_code: 200,
        message: "Aadhaar OTP verified successfully",
      });
    }

    // Save verified data to MongoDB (assuming you have the model for this)
    const aadhaarData = {
      add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
      mobile_number, // Add the mobile number from the decoded JWT
      aadhaar_number: responseData.data.aadhaar_number,
      ad_client_id: responseData.data.client_id,
      ad_full_name: responseData.data.full_name,
      ad_dob: responseData.data.dob,
      ad_gender: responseData.data.gender,
      ad_address_country: responseData.data.address?.country || "",
      ad_address_distic: responseData.data.address?.dist || "",
      ad_address_state: responseData.data.address?.state || "",
      ad_address_po: responseData.data.address?.po || "",
      ad_address_location: responseData.data.address?.loc || "",
      ad_address_vtc: responseData.data.address?.vtc || "",
      ad_address_subdist: responseData.data.address?.subdist || "",
      ad_address_street: responseData.data.address?.street || "",
      ad_address_house: responseData.data.address?.house || "",
      ad_address_landmark: responseData.data.address?.landmark || "",
      ad_face_status: responseData.data.face_status || "",
      ad_face_score: responseData.data.face_score || "",
      ad_zip: responseData.data.zip || "",
      ad_profile_image: responseData.data.profile_image || "",
      ad_has_image: responseData.data.has_image || "",
      ad_email_hash: responseData.data.email_hash || "",
      ad_mobile_hash: responseData.data.mobile_hash || "",
      ad_raw_xml: responseData.data.raw_xml || "",
      ad_zip_data: responseData.data.zip_data || "",
      ad_care_of: responseData.data.care_of || "",
      ad_share_code: responseData.data.share_code || "",
      ad_mobile_verified: responseData.data.mobile_verified || "",
      ad_reference_id: responseData.data.reference_id || "",
      ad_aadhaar_pdf: responseData.data.aadhaar_pdf || "",
      ad_status: responseData.data.status || "",
      ad_uniqueness_id: responseData.data.uniqueness_id || "",
      ad_status_code: responseData.status_code,
      ad_success: responseData.success,
      ad_message: responseData.message,
      ad_message_code: responseData.message_code,
    };

    await AadharVerification.create(aadhaarData);

    return res.status(200).json({
      status_code: 200,
      message: "OTP verified and data saved successfully",
    });
  } catch (error) {
    console.error("Error verifying Aadhaar OTP:", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error" });
  }
}

module.exports= {
    addLead,
    getAgentInfo,
    getLeadsByAgentNumber,
    getRegisteredServiceProviderByAgentNumber,
    getAllLeadsRegisteredByAgentNumber,
    serviceProviderCreateOTP,
    serviceProviderVerifyOTP,
    sendAadhaarOTPServiceProvider,
    verifyAadhaarOTPServiceProvider
};