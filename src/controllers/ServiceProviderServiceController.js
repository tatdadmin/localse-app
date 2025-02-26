// controllers/serviceProviderServiceController.js
const ServiceProviderFailedSearch = require("../models/ServiceProviderFailedSearch")
const ServiceProviderLatLong = require("../models/service_provider_lat_long");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { default: axios } = require("axios");
const Services = require("../models/Services");
const serviceProviderModel = require("../models/serviceProviderModel");
const serviceProviderAadharVerification = require("../models/serviceProviderAadharVerification");
// const service_provider_lat_long = require("../models/service_provider_lat_long");
const ServiceProviderNotifications = require("../models/ServiceProviderNotifications");
const AgentLeads = require("../models/AgentLeads");
const Login = require("../models/Login");
const AppDetails = require("../models/AppDetails");
const service_provider_lat_long = require("../models/service_provider_lat_long");

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// POST - Add a new service
exports.addServiceProviderService = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(200).json({
        success: false,
        status_code: 200,
        message: "JWT token required",
      });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(200).json({
        success: false,
        status_code: 400,
        message: "Invalid or expired JWT token",
      });
    }

    const {
      service_type,
      service_type_synonym,
      service_category,
      services_added_by,
      service_active_status,
    } = req.body;

    const newService = new Services({
      add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
      service_type,
      service_type_synonym,
      service_category,
      services_added_by,
      service_active_status,
    });

    await newService.save();
    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "Service added successfully",
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      status_code: 400,
      message: "Error adding service",
      error: error.message,
    });
  }
};

// GET - Retrieve all services
exports.getServiceProviderServices = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "JWT token required",
      });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        status_code: 400,
        message: "Invalid or expired JWT token",
      });
    }

    // Fetch only services where service_active_status is '1'
    const services = await Services.find({
      service_active_status: "1",
    });

    // Extract only the service_type from the filtered services
    const serviceNames = services.map((service) => service.service_type);
    const sortedServiceNames = serviceNames.sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "Active services retrieved successfully",
      data: sortedServiceNames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error retrieving active services",
      error: error.message,
    });
  }
};


exports.searchServiceProviderService = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "JWT token required",
      });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        status_code: 400,
        message: "Invalid or expired JWT token",
      });
    }

    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        status_code: 400,
        message: "Keyword is required",
      });
    }

    // Fetch services where service_active_status = 1 and filter based on user input (case insensitive)
    // const services = await Services.find({
    //   service_active_status: "1",
    //   service_type: { $regex: new RegExp(keyword, "i") }, // Case-insensitive search
    // }).sort({ service_type: 1 }); // Sorting in ascending order

    const services = await Services.find({
      service_active_status: "1",
      service_type_synonym: { $regex: new RegExp(keyword, "i") }, // Case-insensitive search in synonyms
    }).sort({ service_type: 1 }); // Sorting results alphabetically
    
    // Extract only `service_type` from the matched services
    const serviceNames = services.map((service) => service.service_type);
    if (services.length > 0) {
      // If services are found, return the results
      return res.status(200).json({
        success: true,
        status_code: 200,
        message: "Service Type retrieved successfully",
        data: serviceNames
        //  services.map((service) => service.service_type),
      });
    } else if (keyword.length >= 3) {
      // If no services are found and the search keyword is at least 3 characters long, save it in failed search

      const latestLocation = await service_provider_lat_long
      .findOne({ mobile_number: decodedToken.mobile })
      .sort({ add_date: -1 });

      const service_provider_lat_long_address =
        latestLocation?.address || ""; // Use address if found, otherwise empty string

      const failedSearch = new ServiceProviderFailedSearch({
        add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
        //  moment().format("YYYY:MM:DD:HH:mm:ss"), // Correct date format
        service_provider_mobile_number: decodedToken.mobile,
        service_provider_lat_long_address: service_provider_lat_long_address,
        search_keyword: keyword,
      });

      await failedSearch.save();
    }

    return res.status(200).json({
      success: false,
      status_code: 404,
      message: "No services found",
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error searching services",
      error: error.message,
    });
  }
};


exports.saveServicePartnerRegistration = async(req,res)=>{
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "JWT token required",
      });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        status_code: 400,
        message: "Invalid or expired JWT token",
      });
    }
    const {mobile}= decodedToken;
    

    const { service_provider_mobile_number, service_type, service_area, service_provider_aadhar_number, service_provider_manual_address } = req.body;

    if(!service_provider_mobile_number || !service_type || !service_area || !service_provider_aadhar_number || !service_provider_manual_address){
      return res.status(400).json({
        status_code:400,
        message: "Please provide : service_provider_mobile_number,service_type,service_area,service_provider_aadhar_number,service_provider_manual_address"
      })
    }

    if(service_provider_mobile_number != mobile){
      return res.status(400).json({
        status_code:400,
        message:"Phone number didnot match"
      })
    }

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
       const uploadedFile = req.file;

       let imageNameUploaded=""
       if(uploadedFile){
        imageNameUploaded= uploadedFile.filename
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
          service_provider_mobile_number: mobile ,// Mobile number of the service provider
          from: "Auto",                  // Sender of the notification
          readStatus: "0",  // Read status ('0' for unread, '1' for read)
          addDate: new Date()
        })

        await newDataNotification.save();

        const agentLeadData = await AgentLeads.findOne({
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

exports.getServiceLocalities = async(req,res)=>{
try {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      message: "JWT token required",
    });
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      status_code: 400,
      message: "Invalid or expired JWT token",
    });
  }
  const {mobile}= decodedToken;
  // Need to work upon
  
} catch (error) {
  return res.status(500).json({
    success: false,
    status_code: 500,
    message: "Error in Getting Service Localities",
    error: error.message,
  });
}
}

exports.getAppVersionInfo = async(req,res)=>{
try {
  
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      message: "JWT token required",
    });
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      status_code: 400,
      message: "Invalid or expired JWT token",
    });
  }
  const {mobile}= decodedToken;
  const {user_type,app_type}= req.body;
  if(!user_type || !app_type  ){
    return res.status(400).json({ error: 'Invalid data, Please provide user_type, app_type, and  in req body' });
  }
  const appDetailsData= await AppDetails.findOne({
    user_type: user_type,
    app_type: app_type,
  });
  if(appDetailsData){
    return res.status(200).json({
      status_code:200,
      message:"App Details retrieved Successfuly",
      data:appDetailsData
    });
  }else{
    return res
      .status(400)
      .json({
        status_code: 400,
        message:
          "No Details Found for such request",
      });
  }
} catch (error) {
  console.log("Error in getting App Version Info",error)
  return res
  .status(500)
  .json({ status_code: 500, message: "Internal server error" });
}
}
exports.training = async(req,res)=>{
try {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      message: "JWT token required",
    });
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      status_code: 400,
      message: "Invalid or expired JWT token",
    });
  }
  const {mobile}= decodedToken;
  
  const loginExist= await Login.findOne({
    mobile_number:mobile,
    page_url: "Service Provider Login"
  }).sort({login_time: -1})

  if(!loginExist){
    return res.status(200).json({
      msg_type:"error",
      status_code:200,
      message: "Service Provider Not Found in Login db"
    })
  }
  const englishTitle = 'Connecting Local Needs with Local Talent'; 
  const englishContent = 'Welcome to LocaleSE, your one-stop platform to find and connect with trusted service providers in your area. Empowering communities, one connection at a time.';
  const hindiTitle = 'स्थानीय ज़रूरतों को स्थानीय प्रतिभा से जोड़ना।'; 
  const hindiContent = 'LocaleSE में आपका स्वागत है, जहां आपको अपने क्षेत्र में भरोसेमंद सेवा प्रदाताओं को खोजने और उनसे जुड़ने का सबसे आसान तरीका मिलता है। हमारी कोशिश है आपके समुदाय को मजबूत बनाना, एक कनेक्शन के माध्यम से। स्थानीय ज़रूरतों को स्थानीय प्रतिभा से जोड़ना। एक पुल है।';

  // Build the response data
  const responseData = {
    status_code: 200,
    message: 'Login data retrieved successfully',
    data: {
      english_video: 'SsG_qwb0zLs',
      hindi_video: 'SsG_qwb0zLs',
      english_title: englishTitle,
      english_content: englishContent,
      hindi_title: hindiTitle,
      hindi_content: hindiContent
    }
  };

  return res.status(200).json(responseData)
} catch (error) {
  return res.status(500).json({
    success: false,
    status_code: 500,
    message: "Error in Training ",
    error: error.message,
  });
}
}
