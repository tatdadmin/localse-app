const AgentLead = require("../models/AgentLeads");
const AppLoginAttempt = require("../models/AppLoginAttempt");
const serviceProviderModel = require("../models/serviceProviderModel");
const { sendSms } = require("../utils/sendSms");
require("dotenv").config();
const moment = require("moment");
const axios = require("axios");
const AadhaarVerificationAttempt = require("../models/ZAadharVerificationAttempt")

const AadharVerification = require("../models/serviceProviderAadharVerification");
const { uploadServiceProvider } = require("../config/multerConfig");
const Services = require("../models/Services");
const serviceProviderAadharVerification = require("../models/serviceProviderAadharVerification");
const service_provider_lat_long = require("../models/service_provider_lat_long");
const ServiceProviderNotifications = require("../models/ServiceProviderNotifications");
const ServiceProviderLatLong = require("../models/service_provider_lat_long");

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

async function uploadImageToAWS(req, res, next) {
  uploadServiceProvider.single("service_provider_image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "Image upload failed", details: err.message });
    }
    next(); // Proceed to the next middleware
  });
}


async function getLatitudeLongitude(address) {
  // return [28.6129,77.2295]
  // Replace YOUR_API_KEY with your actual Google Maps Geocoding API key
  const apiKey = 'AIzaSyAaYD9dofRG4HJ_KhOETyfFjFJs4Ni8uf4'; // Replace with your actual API key
  const encodedAddress = encodeURIComponent(address);

  // Geocoding URL to send the request
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
      // Make the GET request to the Google Maps Geocoding API
      const response = await axios.get(url);
      // Check if the response contains the results
      if (response.data.status === 'OK') {
          // Extract the latitude and longitude
          const latitude = response.data.results[0].geometry.location.lat;
          const longitude = response.data.results[0].geometry.location.lng;

          // Return the latitude and longitude as an array
          return [latitude, longitude];
          
      } else {
          // If no results found, return false
          return false;
      }
  } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error occurred while fetching geolocation:', error);
      return false;
  }
}


async function generateAadhaarAddress(serviceProviderAadharVerificationData) {
  // Combine address fields into a single string
  const addressParts = [
      serviceProviderAadharVerificationData.ad_address_house,          // House Number
      serviceProviderAadharVerificationData.ad_address_street,         // Street
      serviceProviderAadharVerificationData.ad_address_vtc,            // VTC (if available)
      serviceProviderAadharVerificationData.ad_address_location,      // Location
      serviceProviderAadharVerificationData.ad_address_po,            // PO (Postal Code)
      serviceProviderAadharVerificationData.ad_address_landmark,      // Landmark
      serviceProviderAadharVerificationData.ad_address_subdist,       // Subdistrict
      serviceProviderAadharVerificationData.ad_address_distic,        // District
      serviceProviderAadharVerificationData.ad_address_state,         // State
      serviceProviderAadharVerificationData.ad_address_country,       // Country
      serviceProviderAadharVerificationData.ad_zip                    // Zip Code
  ];

  // Remove any empty parts from the address array
  const fullAddress = addressParts.filter(Boolean).join(', ');

  return fullAddress;
}

const translateContent = async (text, targetLanguage) => {
  if (!(text && targetLanguage)) {
    return text;
  }
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2`,
      {},
      {
        params: {
          q: text,
          target: targetLanguage,
          key: process.env.GOOGLE_TRANSLATE_API_KEY,
        },
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation Error:", error.response?.data || error.message);
    return text; // Return original text if an error occurs
  }
};



async function serviceProviderRegistrationByAgentPanel(req,res){
    try {

      const agentMobileNumber= req.user.mobile;
      const { service_provider_mobile_number, service_type, service_area, service_provider_aadhar_number, service_provider_manual_address } = req.body;
      if(!service_provider_mobile_number || !service_type || !service_area || !service_provider_aadhar_number || !service_provider_manual_address){
        return res.status(400).json({
          status_code:400,
          message: "Please provide : service_provider_mobile_number,service_type,service_area,service_provider_aadhar_number,service_provider_manual_address"
        })
      }
  
      const mobile= service_provider_mobile_number;
  
      const servicesData= await Services.findOne({
        service_type:service_type
      }).select("service_category")
  
    if(!servicesData){
      return res.status(400).json({
        status_code:400,
        message: "No ServiceType Found"
      })
    }
  
      const existingServiceProvider= await serviceProviderModel.findOne({
        service_provider_mobile_number:mobile
      })
  
      if(existingServiceProvider){
        return res.status(200).json({
          status_code:200,
          message: "Service provider already registered",
          msg_type: "error"
        })
      }
  
         // Handle file upload for photograph if provided 
  
         let imageNameUploaded=""
         if(req.file.location){
          imageNameUploaded= req.file.location
         }
  
         const addDate= new Date();
         const manualLatLong= await getLatitudeLongitude(service_provider_manual_address);
         
         if(manualLatLong == false){
          return res.status(400).json({
            status_code:400,
            message:"Please Enter Proper service_provider_manual_address"
          })
         }
         const [currentLat, currentLong] = manualLatLong;
         const currentLatLong = `${currentLat},${currentLong}`;
  
        const serviceProviderData = new serviceProviderModel({
          service_type: service_type,
          service_category: servicesData.service_category,
          service_provider_mobile_number: mobile,
          language: "English",
          rating: 4.5,
          service_provider_aadhar_number: service_provider_aadhar_number,
          current_address: service_provider_manual_address,
          current_latlong: currentLatLong,
          panel_login: "0",
          service_provider_image: imageNameUploaded
      });
  
      await serviceProviderData.save();
  
      const againServiceProviderData = await serviceProviderModel.findOne({
          service_provider_mobile_number: mobile
      });
  
  
  
      if (!againServiceProviderData) {
          return res.status(404).json({
              message: "Service provider not found",
              status_code: 404
          });
      }
  
      // Step 3: Check if the required fields are missing (service_provider_name or aadhaar_address)
      if (!againServiceProviderData.service_provider_name || !againServiceProviderData.aadhaar_address) {
        
  
          // Fetch the service provider Aadhar verification data
          const serviceProviderAdharVerificationData = await serviceProviderAadharVerification.findOne({
              mobile_number: mobile
          });
  
          if (!serviceProviderAdharVerificationData) {
              return res.status(400).json({
                  message: "No Aadhaar with following number",
                  status_code: 400
              });
          }
  
          const FullAddress= await generateAadhaarAddress(serviceProviderAdharVerificationData);
  
          const [adharLat,adharLong]= await getLatitudeLongitude(FullAddress);
          againServiceProviderData.service_provider_name =  serviceProviderAdharVerificationData.ad_full_name;
          againServiceProviderData.aadhaar_address = FullAddress// serviceProviderAdharVerificationData.ad_address_location; // Update the aadhaar address as needed
  
          const fullName = serviceProviderAdharVerificationData.ad_full_name;
          const translations = await Promise.all([
            translateContent(FullAddress, "hi"),
            translateContent(FullAddress, "ur"),
            translateContent(FullAddress, "mr"),
            translateContent(FullAddress, "ml"),
            translateContent(FullAddress, "ta"),
            translateContent(FullAddress, "te"),
    
            translateContent(fullName, "hi"),
            translateContent(fullName, "ur"),
            translateContent(fullName, "mr"),
            translateContent(fullName, "ml"),
            translateContent(fullName, "ta"),
            translateContent(fullName, "te")
        ]);
  
        againServiceProviderData.aadhaar_address_hindi = translations[0];
        againServiceProviderData.aadhaar_address_urdu = translations[1];
        againServiceProviderData.aadhaar_address_marathi = translations[2];
        againServiceProviderData.aadhaar_address_malayalam = translations[3];
        againServiceProviderData.aadhaar_address_tamil = translations[4];
        againServiceProviderData.aadhaar_address_telugu = translations[5];
        
        againServiceProviderData.service_provider_name_hindi = translations[6];
        againServiceProviderData.service_provider_name_urdu = translations[7];
        againServiceProviderData.service_provider_name_marathi = translations[8];
        againServiceProviderData.service_provider_name_malayalam = translations[9];
        againServiceProviderData.service_provider_name_tamil = translations[10];
        againServiceProviderData.service_provider_name_telugu = translations[11];
  
          againServiceProviderData.active_status = "1";
          againServiceProviderData.aadhaar_address_latlong=`${adharLat},${adharLong}`;
  
          const serviceProviderLatLongDataa = await service_provider_lat_long
          .findOne({ mobile_number: mobile })
          .sort({ add_date: -1 });  // Sort by add_date in descending order (latest first)
  
          if(!serviceProviderLatLongDataa){
            return res.status(400).json({
              status_code:400,
              message:"service provider lat long data not found!"
            })
          }
          const latt= serviceProviderLatLongDataa.latitude;
          const longg= serviceProviderLatLongDataa.longitude;
          const addresss= serviceProviderLatLongDataa.address
  
          againServiceProviderData.current_latlong=  `${latt},${longg}`;
          againServiceProviderData.current_latlong_address= addresss;
  
       
  
  
          const newDataNotification= new ServiceProviderNotifications({
            subject: "Welcome to Localse."  ,         // Subject of the notification
            content:  "You’ve just taken the first step toward something extraordinary.\nWe’re excited to have you as part of our community.\nLocalse is where opportunities and action come together.\nLet’s move forward together.",               // Content of the notification
            subject_hindi: "लोकलसे में आपका स्वागत है।",
            content_hindi: "आपने कुछ असाधारण की ओर पहला कदम बढ़ाया है।\nहम आपको हमारे समुदाय का हिस्सा बनकर उत्साहित हैं।\nलोकलसे वह जगह है जहाँ अवसर और कार्य एक साथ आते हैं।\nआइए साथ मिलकर आगे बढ़ें।",
            
            // Urdu
            subject_urdu: "لوکالز میں خوش آمدید۔",
            content_urdu: "آپ نے کچھ غیر معمولی کی طرف پہلا قدم اٹھایا ہے۔\nہمیں خوشی ہے کہ آپ ہمارے کمیونٹی کا حصہ ہیں۔\nلوکالز وہ جگہ ہے جہاں مواقع اور عمل ایک ساتھ آتے ہیں۔\nآئیے مل کر آگے بڑھیں۔",
            
            // Marathi
            subject_marathi: "लोकलसे मध्ये आपले स्वागत आहे.",
            content_marathi: "तुम्ही काहीतरी असामान्य करण्यासाठी पहिलं पाऊल टाकलं आहे.\nआम्हाला आनंद आहे की तुम्ही आमच्या समुदायाचा भाग आहात.\nलोकलसे ही अशी जागा आहे जिथे संधी आणि कृती एकत्र येतात.\nचला एकत्र पुढे जाऊया.",
          
            // Tamil
            subject_tamil: "லோகல்ஸுக்கு வரவேற்கிறோம்.",
            content_tamil: "நீங்கள் ஏதோ அசாதாரணமான ஒன்றை நோக்கி முதல் அடியெடுத்து வைத்துள்ளீர்கள்.\nநாங்கள் உங்களை எங்கள் சமூகத்தில் சேர்வதற்கு உற்சாகமாக இருக்கிறோம்.\nலோகல்ஸ் என்பது வாய்ப்புகளும் செயல்பாடுகளும் ஒன்றாக கூடும் இடம்.\nநாம் ஒன்றாக முன்னேறலாம்.",
          
            // Telugu
            subject_telugu: "లోకల్స్‌కు స్వాగతం.",
            content_telugu: "మీరు అద్భుతమైన దిశగా మొదటి అడుగు వేసారు.\nమేము మిమ్మల్ని మా సముదాయంలో భాగమవ్వడం చాలా ఆనందంగా ఉంది.\nలోకల్స్ అనేది అవకాశాలు మరియు చర్యలు కలుసుకునే ప్రదేశం.\nమనమందరం కలిసి ముందుకు సాగుదాం.",
          
            // Malayalam
            subject_malayalam: "ലോകല്സിലേക്ക് സ്വാഗതം.",
            content_malayalam: "നിങ്ങൾ ഒരു അത്യന്തം ശ്രദ്ധേയമായ ദിശയിലേക്ക് ആദ്യ ചുവട് വച്ചു.\nനിങ്ങളെ ഞങ്ങളുടെ സമൂഹത്തിലെ അംഗമാക്കാൻ ഞങ്ങൾ ആവേശഭരിതരാണ്.\nലോകല്സ് എന്നത് അവസരങ്ങളും പ്രവർത്തനങ്ങളും ഒന്നിച്ച് വരുന്ന ഇടമാണ്.\nനാം ഒരുമിച്ച് മുന്നോട്ട് പോകാം.",
          
            service_provider_mobile_number: mobile ,// Mobile number of the service provider
            from: "Auto",                  // Sender of the notification
            readStatus: "0",  // Read status ('0' for unread, '1' for read)
            addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
          })
  
          await newDataNotification.save();
  
          const agentLeadData = await AgentLead.findOne({
            agent_number:agentMobileNumber,
            service_provider_mobile_number: mobile
          }).sort({ add_date: -1 });
          
          
          if(agentLeadData){
            againServiceProviderData.agent_number= agentLeadData.agent_number;
            agentLeadData.registered= 1;
            await agentLeadData.save();
          }
  
  
          await againServiceProviderData.save();
  
          return res.status(200).json({
            status_code:200,
            message: "Service provider registered successfully",
            redirect: "service-provider-panel",
            service_provider_id: againServiceProviderData._id
          })
  
         }
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        status_code: 500,
        message: "Error in Saving Service Partner Registration",
        error: error.message,
      });
    }
}

async function addServiceProviderLatLongByAgentPanel(req,res){
    try {
      const { latitude, longitude,service_provider_mobile_number } = req.body;
  
      if(!latitude || !longitude || !service_provider_mobile_number){
        return res.status(400).json({
          status_code:400,
          message:"Provide latitude , longitude and service_provider_mobile_number"
        })
      }
     
      const mobile_number = service_provider_mobile_number;
  
      const newLocation = new ServiceProviderLatLong({
        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
        mobile_number,
        latitude,
        longitude,
        place_id: "", 
        address: "" 
      });
  
      await newLocation.save();
      return res.status(200).json({
          success: true,
          status_code: 200,
          message: "Location added successfully",
          data: newLocation
        });
  
    } catch (error) {
      return res.status(500).json({ success: false,status_code: 500, message: "Error adding location", error: error.message });
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
    verifyAadhaarOTPServiceProvider,
    uploadImageToAWS,
    serviceProviderRegistrationByAgentPanel,
    addServiceProviderLatLongByAgentPanel
};