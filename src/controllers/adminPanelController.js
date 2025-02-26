const jwt = require("jsonwebtoken");
const AdminLogin = require("../models/AdminLogin");
const serviceProviderModel = require("../models/serviceProviderModel");
require("dotenv").config();
const axios = require("axios");
const ServiceProviderNotifications = require("../models/ServiceProviderNotifications");

// Google Translate API function
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


async function generateJWT(user, timeInSecond) {
    const payload = {
      iss: "https://www.localse.in",
      aud: "https://www.localse.in",
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + timeInSecond, 
      data: {
        mobile_number: user.mobile_number,
        user_type: "Admin",
      },
    };
  
    // Sign JWT token
    return jwt.sign(payload, process.env.ADMIN_JWT_SECRET, { algorithm: "HS256" });
  }

async function handleAdminLogin(req,res){
try {
    const {mobile_number,pin}= req.body;

    const adminLogin= await AdminLogin.findOne({
        mobile_number:mobile_number
    });
    if(!adminLogin){
        return res.status(400).json({
            status_code:400,
            message:"Mobile Number Is Not Correct"
        })
    }
    if(adminLogin.pin != pin){
        return res.status(400).json({
            status_code:400,
            message:"Pin is Incorrect"
        })
    }

    const adminData= {mobile_number,user_type:"Admin"};
    const adminJWTExp = process.env.ADMIN_JWTEXPIRATION;
    const jwt= await generateJWT(adminData,adminJWTExp*60);
    const refresh_token= await generateJWT(adminData,60*60*24);
    return res.status(200).json({
        status_code:200,
        message:"Successfully Logged In",
        jwt:jwt,
        refresh_token:refresh_token
    })
} catch (error) {
    console.log("Error in Admin Login",error)
    return res
    .status(500)
    .json({ status_code: 500, message: "Internal server error" });
}
}

async function createNotification(req,res){
try {
    const adminMobileNumber= req.user.mobile_number
    const { subject, content, to_all, service_provider_mobile_number } = req.body;
    if(!subject || !content){
        return res.status(400).json({
            status_code:400,
            message: "Provide subject and Content in Req Body"
        })
    }
    if(to_all =="1"){
        const serviceProvidersMobileNumbers= await serviceProviderModel.find({},"service_provider_mobile_number");
        const serviceProviderMobiles= serviceProvidersMobileNumbers.map(sp => sp.service_provider_mobile_number);

        const translations = await Promise.all([
            translateContent(subject, "hi"),
            translateContent(subject, "ur"),
            translateContent(subject, "mr"),
            translateContent(subject, "ml"),
            translateContent(subject, "ta"),
            translateContent(subject, "te"),
    
            translateContent(content, "hi"),
            translateContent(content, "ur"),
            translateContent(content, "mr"),
            translateContent(content, "ml"),
            translateContent(content, "ta"),
            translateContent(content, "te")
        ]);
    
        const [
            subjectHindi, subjectUrdu, subjectMarathi, subjectMalayalam, subjectTamil, subjectTelugu,
            contentHindi, contentUrdu, contentMarathi, contentMalayalam, contentTamil, contentTelugu
        ] = translations;
    
        const notifications = serviceProviderMobiles.map(mobile => ({
            subject,
            content,
            service_provider_mobile_number: mobile,
            from: adminMobileNumber,
            readStatus: "0",
            addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
            createdAt: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    
            // Translated content
            subjectHindi, contentHindi,
            subjectMarathi, contentMarathi,
            subjectUrdu, contentUrdu,
            subjectMalayalam, contentMalayalam,
            subjectTamil, contentTamil,
            subjectTelugu, contentTelugu
        }));
    
        // Insert all notifications in one go (bulk insert)
        await ServiceProviderNotifications.insertMany(notifications);

        return res.status(200).json({
            status_code:200,
            message:"Notifications have been sent Successfully To ALL"
        })
    }else if(to_all =="0" && service_provider_mobile_number){
        const serviceProviderData= await serviceProviderModel.find({
            service_provider_mobile_number:service_provider_mobile_number
        })

        if(!serviceProviderData){
            return res.status(400).json({
                status_code:400,
                message:"Service Provider Not Found with service_provider_mobile_number"
            })
        }

        let subjectHindi= await translateContent(subject,"hi");
        let subjectUrdu= await translateContent(subject,"ur");
        let subjectMarathi= await translateContent(subject,"mr");
        let subjectMalayalam= await translateContent(subject,"ml");
        let subjectTamil = await translateContent(subject,"ta");
        let subjectTelugu = await translateContent(subject,"te");

        let contentHindi= await translateContent(content,"hi");
        let contentUrdu= await translateContent(content,"ur");
        let contentMarathi= await translateContent(content,"mr");
        let contentMalayalam= await translateContent(content,"ml");
        let contentTamil= await translateContent(content,"ta");
        let contentTelugu= await translateContent(content,"te");


        const notification = await ServiceProviderNotifications({
            subject,
            content,
            service_provider_mobile_number,
            from:adminMobileNumber,
            readStatus: "0",
            addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
            createdAt: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
            subjectHindi,
            contentHindi,
            subjectMarathi,
            contentMarathi,
            subjectUrdu,
            contentUrdu,
            subjectMalayalam,
            contentMalayalam,
            subjectTamil,
            contentTamil,
            subjectTelugu,
            contentTelugu
        })  ;
        await notification.save();

        return res.status(200).json({
            status_code:200,
            message:`Notification Send Successfully to ${service_provider_mobile_number}` 
        })
    }else{
        return res.status(400).json({
            status_code:400,
            message:"Plz provide Valid Json Body"
        })
    }
} catch (error) {
    console.log("Error in Create Notification",error)
    return res
    .status(500)
    .json({ status_code: 500, message: "Internal server error" });
}
}

module.exports={
handleAdminLogin,
createNotification
}  