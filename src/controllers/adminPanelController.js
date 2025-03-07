const jwt = require("jsonwebtoken");
const AdminLogin = require("../models/AdminLogin");
const serviceProviderModel = require("../models/serviceProviderModel");
require("dotenv").config();
const axios = require("axios");
const ServiceProviderNotifications = require("../models/ServiceProviderNotifications");
const LocalseDictionary = require("../models/LocalseDictionary");
const ServiceProviderNoticeBoard = require("../models/ServiceProviderNoticeBoard");
const { default: mongoose } = require("mongoose");

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
    const jwt= await generateJWT(adminData,adminJWTExp*60*60*2.4);
    const refresh_token= await generateJWT(adminData,60*60*24);
    
    //we have added the data for localseDictionary
    const currentData= await LocalseDictionary.find({});
    if(currentData.length ==0){
        const localseDictionaryData= new LocalseDictionary({
            subject: "Welcome",
            content: "Welcome to our platform",
            subject_hindi: "स्वागत है",
            content_hindi: "हमारे प्लेटफॉर्म में आपका स्वागत है",
            subject_urdu: "خوش آمدید",
            content_urdu: "ہمارے پلیٹ فارم میں خوش آمدید",
            subject_marathi: "स्वागत आहे",
            content_marathi: "आमच्या प्लॅटफॉर्मवर आपले स्वागत आहे",
            subject_telugu: "స్వాగతం",
            content_telugu: "మా ప్లాట్‌ఫామ్‌కు స్వాగతం",
            subject_malayalam: "സ്വാഗതം",
            content_malayalam: "ഞങ്ങളുടെ പ്ലാറ്റ്ഫോമിലേക്ക് സ്വാഗതം",
            subject_tamil: "வரவேற்கிறோம்",
            content_tamil: "எங்கள் தளத்திற்குச் வரவேற்கிறோம்",
        })
        await localseDictionaryData.save();
    }
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
            subject_hindi, subject_urdu, subject_marathi, subject_malayalam, subject_tamil, subject_telugu,
            content_hindi, content_urdu, content_marathi, content_malayalam, content_tamil, content_telugu
        ]= translations;
    
        const notifications = serviceProviderMobiles.map(mobile => ({
            subject,
            content,
            service_provider_mobile_number: mobile,
            from: adminMobileNumber,
            readStatus: "0",
            addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
            createdAt: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    
            // Translated content
            subject_hindi, content_hindi,
            subject_marathi, content_marathi,
            subject_urdu, content_urdu,
            subject_malayalam, content_malayalam,
            subject_tamil, content_tamil,
            subject_telugu, content_telugu    
        }));
    
        // Insert all notifications in one go (bulk insert)
        await ServiceProviderNotifications.insertMany(notifications);

        return res.status(200).json({
            status_code:200,
            message:"Notifications have been sent Successfully To ALL"
        })
    }else if(to_all =="0" && service_provider_mobile_number){
      
        const mobileNumbers = service_provider_mobile_number.split(",").map(num => num.trim()); // Convert to array

        for (const mobileNumber of mobileNumbers) {
            const serviceProviderData = await serviceProviderModel.findOne({
                service_provider_mobile_number: mobileNumber
            });
    
            if (!serviceProviderData) {
                return res.status(400).json({
                    status_code: 400,
                    message: `Service Provider Not Found with service_provider_mobile_number: ${mobileNumber}`
                });
            }

        }
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
            subject_hindi, subject_urdu, subject_marathi, subject_malayalam, subject_tamil, subject_telugu,
            content_hindi, content_urdu, content_marathi, content_malayalam, content_tamil, content_telugu
        ]= translations;
    
        const notifications = mobileNumbers.map(mobile => ({
            subject,
            content,
            service_provider_mobile_number: mobile,
            from: adminMobileNumber,
            readStatus: "0",
            addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
            createdAt: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    
            // Translated content
            subject_hindi, content_hindi,
            subject_marathi, content_marathi,
            subject_urdu, content_urdu,
            subject_malayalam, content_malayalam,
            subject_tamil, content_tamil,
            subject_telugu, content_telugu    
        }));
    
        // Insert all notifications in one go (bulk insert)
        await ServiceProviderNotifications.insertMany(notifications);

        return res.status(200).json({
            status_code:200,
            message:`Notification Send Successfully to ${mobileNumbers}` 
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

async function createNotice(req,res){
    try {
        const adminMobileNumber= req.user.mobile_number
        const { subject, content } = req.body;
        if(!subject || !content){
            return res.status(400).json({
                status_code:400,
                message: "Provide subject and Content in Req Body"
            })
        }

            const languages = ["hi", "ur", "mr", "ml", "ta", "te"];
            const subjectTranslations = await Promise.all(
                languages.map(lang => translateContent(subject, lang))
            );
            const contentTranslations = await Promise.all(
                languages.map(lang => translateContent(content, lang))
            );
            const [
                subject_hindi, subject_urdu, subject_marathi, 
                subject_malayalam, subject_tamil, subject_telugu
            ] = subjectTranslations;
    
            const [
                content_hindi, content_urdu, content_marathi, 
                content_malayalam, content_tamil, content_telugu
            ] = contentTranslations;
    
    
            const notice = new ServiceProviderNoticeBoard({
                subject,
                content,
                from:adminMobileNumber,
                addDate: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
                createdAt: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
                subject_hindi,
                content_hindi,
                subject_marathi,
                content_marathi,
                subject_urdu,
                content_urdu,
                subject_malayalam,
                content_malayalam,
                subject_tamil,
                content_tamil,
                subject_telugu,
                content_telugu
                
            })  ;
            await notice.save();
    
            return res.status(200).json({
                status_code:200,
                message:`Notice Created Successfully` 
            })
    } catch (error) {
        console.log("Error in Creating Notice",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
    }
    }
async function getAllNotice(req,res){
    try {
        const allNoticeData= await ServiceProviderNoticeBoard.find({});
        return res.status(200).json({
            status_code:200,
            message:"Successfully Retrieved Notices",
            data:allNoticeData
        })
    } catch (error) {
        console.log("Error in Getting Notice",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });        
    }
}
async function getAllNotification(req,res){
    try {
        const {service_provider_mobile_number} = req.query;
        let notificationData;
        if(service_provider_mobile_number){
            notificationData= await ServiceProviderNotifications.find({
                service_provider_mobile_number:service_provider_mobile_number
            }).sort({addDate: -1});
        }else{
            notificationData= await ServiceProviderNotifications.find({}).sort({addDate: -1});
        }
        return res.status(200).json({
            status_code:200,
            message:"All Notifications Retrieved Successfully",
            data:notificationData
        })
    } catch (error) {
        console.log("Error in Getting All Notification",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}
async function getAllServiceProvider(req,res){
    try {
        const allServiceProvidersData= await serviceProviderModel.find({}).sort({createdAt: -1});
        return res.status(200).json({
            status_code:200,
            message:"All Service Provider Retrieved Succussfully",
            data:allServiceProvidersData
        })
    } catch (error) {
        console.log("Error in Getting All Service Provider",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

async function deleteNoticeById(req,res){
    try {
        const {id}= req.body;
        if (!id) {
            return res.status(400).json({status_code:400, message: "Notice ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({status_code:400, message: "Invalid Notice ID format" });
        }

        const deletedNotice = await ServiceProviderNoticeBoard.findByIdAndDelete(id);

        if (!deletedNotice) {
            return res.status(400).json({status_code:400, message: "Notice not found with provided id" });
        }

        res.status(200).json({ 
            status_code:200,
            message: "Notice deleted successfully"
         });
    } catch (error) {
        console.log("Error in Deleting Notice by Id",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

async function deleteNotificationById(req,res){
    try {
        const {id}= req.body;
        if (!id) {
            return res.status(400).json({status_code:400, message: "Notice ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({status_code:400, message: "Invalid Notice ID format" });
        }
        const deletedNotification = await ServiceProviderNotifications.findByIdAndDelete(id);

        if(!deletedNotification){
            return res.status(400).json({
                status_code:400,
                message:"Notification Not Found with Provided id"
            })
        }
        return res.status(200).json({
            status_code:200,
            message:`Notification Deleted Succussfully with id=${id}`
        })
    } catch (error) {
        console.log("Error in Deleting Notification by Id",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" }); 
    }
}

module.exports={
handleAdminLogin,
createNotification,
createNotice,
getAllNotice,
getAllNotification,
getAllServiceProvider,
deleteNoticeById,
deleteNotificationById
}  