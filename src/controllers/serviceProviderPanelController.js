const { default: axios } = require("axios");
const CustomerServicesClicks = require("../models/CustomerServicesClicks");
const serviceProviderModel = require("../models/serviceProviderModel");
const ServiceProviderNoticeBoard = require("../models/ServiceProviderNoticeBoard");
const ServiceProviderNoticeBoardClicks = require("../models/ServiceProviderNoticeBoardClicks");
const ServiceProviderNotifications = require("../models/ServiceProviderNotifications");
const ServiceProviderNotificationsVideos = require("../models/ServiceProviderNotificationVideos");
const ServiceProviderVideoLibraryClicks = require("../models/ServiceProviderVideoLibraryClicks");
const service_provider_lat_long = require("../models/service_provider_lat_long");
const ServiceProviderPanelLogins = require("../models/ServiceProviderPanelLogins");
const ServiceProviderSubscriptionValidation = require("../models/ServiceProviderSubscriptionValidation");
const ServiceProviderSubscription = require("../models/ServiceProviderSubscription");


async function hanldeServiceProviderNotice(req,res){
    try {
        const service_provider_mobile_number=req.user.mobile;
        const noticeDetails = await ServiceProviderNoticeBoard.find({ activeStatus: true }).sort({ addDate: -1 });

        const clickedNoticeIds = await ServiceProviderNoticeBoardClicks.find({ service_provider_mobile_number:service_provider_mobile_number })
        .select('noticeBoardId') 
        .sort({ addDate: -1 }); 

        const clickedNoticeIdsArray = clickedNoticeIds.map(item => item.noticeBoardId);

        const notClickedNoticeDetails = noticeDetails.filter(notice => !clickedNoticeIdsArray.includes(notice._id.toString()));
            return res.status(200).json({
                status_code: 200,
                message: 'Notice details retrieved successfully',
                notice_details: noticeDetails,
                unread_notice: notClickedNoticeDetails
            })
        } catch (error) {
            console.log("Error in Service Provider Notice",error)
            return res
            .status(500)
            .json({ status_code: 500, message: "Internal server error" });
        }

}

async function hanldeServiceProviderNoticeBoardClicks(req,res){
try {
    const service_provider_mobile_number=req.user.mobile;
    const {notice_board_id}=req.body;
    if(!notice_board_id){
        return res.status(400).json({
            status_code:400,
            message:"Notice board Id is not Given"
        })
    }
    const newJsonBody= new ServiceProviderNoticeBoardClicks({
        service_provider_mobile_number: service_provider_mobile_number,
        noticeBoardId: notice_board_id,
        addDate: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    })

    await newJsonBody.save();
    return res.status(200).json({
        status_code:200,
        message:"Notice board view successfully"
    })
} catch (error) {
    console.log("Error in Service Provider Notice Board Clicking",error)
    return res
    .status(500)
    .json({ status_code: 500, message: "Internal server error" });
}
}
async function handleServiceProviderNotification(req,res){
    try {
        const service_provider_mobile_number=req.user.mobile;
        const data= await ServiceProviderNotifications.find({
            service_provider_mobile_number: service_provider_mobile_number
        });

        return res.status(200).json({
            status_code:200,
            message:"Service Provider Notifications Data Retrieved Successfully",
            data:data
        })
    } catch (error) {
        console.log("Error in Service Provider Notifications ",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
    }
}
async function serviceProviderNotificationVideos(req,res){
    try {
        const data= await ServiceProviderNotificationsVideos.find({
            view_status :1
        }).sort({add_date: -1});

        if(data.length ===0){
            return res.status(200).json({
                status_code:200,
                message:"Videos Not Found",
                data: null
            })
        }else{
            return res.status(200).json({
                status_code: 200,
                message: "Service Provider Videos Retrived Successfully",
                data:data
            })
        }
    } catch (error) {
         console.log("Error in Service Provider Notifications Videos ",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
    }
}
async function getServiceProviderProfileInfo(req,res){
    try {
        const service_provider_mobile_number=req.user.mobile;
        const serviceProvidersProfileInfo= await serviceProviderModel.findOne({
            service_provider_mobile_number:service_provider_mobile_number,
            active_status:1
        });

        return res.status(200).json({
            status_code:200,
            message:"Service provider Details Retrieved Successfully",
            data:serviceProvidersProfileInfo
        })
    } catch (error) {
        console.log("Error in Service Provider Profile Info ",error)
        return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
    }
}
async function serviceProviderPanelLoginStatus(req,res){
    try {
        const service_provider_mobile_number=req.user.mobile;
        const serviceProviderData= await serviceProviderModel.findOne({
            service_provider_mobile_number:service_provider_mobile_number
        }).select("panel_login")

        return res.status(200).json({
            status_code:200,
            data:serviceProviderData.panel_login
        })
    } catch (error) {
         console.log("Error in Service Provider Panel Login ",error)
         return res
        .status(500)
        .json({ status_code: 500, message: "Internal server error" });
    }
}
async function serviceProviderClick(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;

        const startOfDay = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
        startOfDay.setHours(0, 0, 0, 0); // Set time to the start of today (00:00:00)
      
        const endOfDay = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
        endOfDay.setHours(23, 59, 59, 999); // Set time to the end of today (23:59:59.999)
      
        const todayClickCount = await CustomerServicesClicks.countDocuments({
          service_provider_mobile_number: service_provider_mobile_number,
          add_date: { $gte: startOfDay, $lt: endOfDay }, // Only count clicks between start and end of today
        });

        const today = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
        const lastWeekStart = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
        lastWeekStart.setDate(today.getDate() - 7); // Subtract 7 days for the start of the last week
      
        const weekClickCount = await CustomerServicesClicks.countDocuments({
          service_provider_mobile_number: service_provider_mobile_number,
          add_date: { $gte: lastWeekStart, $lt: today }, // Count clicks from the last 7 days
        });
      
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Get the first day of the current month

        const monthClickCount = await CustomerServicesClicks.countDocuments({
          service_provider_mobile_number: service_provider_mobile_number,
          add_date: { $gte: startOfMonth, $lt: today }, // Count clicks from the start of the current month
        });

        const countOfUnreadNotification = await ServiceProviderNotifications.countDocuments({
            service_provider_mobile_number:service_provider_mobile_number,
            readStatus:0
        });

        return res.status(200).json({
            status_code:200,
            data:{
                today_click:"Today",
                today_click_count: todayClickCount ,
                week_click:"7 Days",
                week_click_count: weekClickCount,
                month_click:"30 Days",
                month_click_count: monthClickCount ,
                unread_notification: countOfUnreadNotification ,
            }
        })
    } catch (error) {
        console.log("Error in Service Provider Click",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}

async function updateServiceProviderNotificationsStatus(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;
        const {notification_id}= req.body;
        if(!notification_id){
            return res.status(400).json({
                status_code:400,
                message: "notification_id is not given in request Body"
            })
        }
        const data= await ServiceProviderNotifications.findOne({
            service_provider_mobile_number:service_provider_mobile_number,
            _id:notification_id
        })
        // console.log("line 217",data)
        if(!data){
            return res.status(400).json({
                status_code:400,
                message: "No data exist with service_provider_mobile_number and notification_id"
            })
        }
        if(data.readStatus == "1"){
            return res.status(200).json({
                status_code:200,
                message:"No matching notification found or readStatus is already 1."
            })
        }
        const result = await ServiceProviderNotifications.updateOne(
            { 
              service_provider_mobile_number: service_provider_mobile_number,  
              _id: notification_id 
            },
            { 
              $set: { readStatus: '1' }  // Set the readStatus to '1'
            }
          );
          return res.status(200).json({
            status_code:200,
            message: "Read status update successfully"
         })
    } catch (error) {
        console.log("Error in Update Service Provider Notication Status",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}
async function handleServiceProviderVideoLibraryClicks(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;
        const {video_id}= req.body;
        if(!video_id){
            return res.status(400).json({
                status_code:400,
                message: "video_id in reqBody should be provided"
            })
        }
        const newClickData= new ServiceProviderVideoLibraryClicks({
            add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
            service_provider_mobile_number:service_provider_mobile_number,
            video_library_id:video_id
        });

        await newClickData.save();
        return res.status(200).json({
            status_code:200,
            message:"Video view successfully"
        })

    } catch (error) {
        console.log("Error in Service Provider Video Library Clicks",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}
async function getAddressFromLatLong(latitude, longitude) {
    // Your Google API Key
    const apiKey = 'AIzaSyAaYD9dofRG4HJ_KhOETyfFjFJs4Ni8uf4';
    
    // Geocoding URL
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    try {
        // Make the HTTP request using axios
        const response = await axios.get(url);
        
        // Check if the response status is OK
        if (response.data.status === 'OK') {
            // Return the formatted address
            return response.data.results[0]?.formatted_address || 'No address found';
        } else {
            return `Error: ${response.data.status}`;
        }
    } catch (error) {
        // Handle any errors that occurred during the request
        return `Error: ${error.message}`;
    }
}


async function handleServiceProviderPanelLogin(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;
        const {action,panel_login_status,new_latitude,new_longitude} = req.body;
        if(!action || !panel_login_status || !new_latitude || !new_longitude){
            return res.status(400).json({
                status_code:400,
                message:"Fields are missing either of action, panel_login_status, new_latitude, new_longitude"
            });
        }

        const newAddress= await getAddressFromLatLong(new_latitude,new_longitude);
        // console.log("line 317",newAddress);
        if(panel_login_status == "1"){
            const serviceProviderLatLongData= await service_provider_lat_long.findOne({
                mobile_number: service_provider_mobile_number
            }).sort({add_date: -1});
            // console.log("line 324",serviceProviderLatLongData)

            if(!serviceProviderLatLongData){
                return res.status(400).json({
                    status_code:400,
                    message:"No Service Provider Lat Long Data Found!"
                })
            }
            const lastDate= serviceProviderLatLongData.add_date;
            const lastLat= serviceProviderLatLongData.latitude;
            const lastLong= serviceProviderLatLongData.longitude;

            const lastDateTime = new Date(lastDate);

// Get the current date and time as a Date object
const currentDateTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));

// Calculate the difference in milliseconds
const differenceInMilliseconds = currentDateTime - lastDateTime;

// Convert milliseconds to minutes
let minutesDifference = differenceInMilliseconds / (1000 * 60);

// console.log(`Minutes Difference: ${minutesDifference} minutes`);

            const serviceProviderData= await serviceProviderModel.findOne({
                service_provider_mobile_number:service_provider_mobile_number
            }).select("aadhaar_address_latlong")

            if(!serviceProviderData){
                return res.status(400).json({
                    status_code:400,
                    message: "service provider Adhar latlong Not Found !"
                })
            }
            const [latitude, longitude] = serviceProviderData.aadhaar_address_latlong.split(',');
            const adharLat= parseFloat(latitude);
            const adharLong= parseFloat(longitude);

            if(minutesDifference <0){
                minutesDifference = minutesDifference* -1;
            }
            // console.log("new minuteDff",minutesDifference);
            if(minutesDifference <=30){

                // now we need to calculate difference of distance addhar latlong and last latlong 
                const distanceDifference= calculateDistance(adharLat,adharLong,lastLat,lastLong);
                // console.log("line 367",distanceDifference);
                if(distanceDifference <=40 ){

                    // update service_provider table panel_login as 1 and last_panel_login should be added as Date
                    const result = await  serviceProviderModel.findOne({
                        service_provider_mobile_number:service_provider_mobile_number,
                        panel_login: "0"
                    });
                    if(!result){
                        return res.status(400).json({status_code:400,message:"Service Provider not Found wiht panel Login as 0"})
                    }
                    result.panel_login="1";
                    result.last_panel_login= new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));

                    await result.save();

                    // add ne data in servic_provider_panel_login
                    const serviceProviderPanelLoginData = new ServiceProviderPanelLogins({
                        active_status:1,
                        service_provider_mobile_number:service_provider_mobile_number,
                        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
                    });
                    await serviceProviderPanelLoginData.save();
                    return res.status(200).json({
                        status_code:200,
                        message: "Service provider successfully login",
                        p_status: true
                    })
                }else{
                    return res.status(200).json({
                        status_code:200,
                        message: "You are not in a serviceable area",
                        p_status:false
                    })
                }

            }else{
    // calculate distance with adharLatLong and requestBody latlongie new_latitude, new_longitude
                const distanceWithBodyLatLongAndAdharLatLong = calculateDistance(adharLat,adharLong,new_latitude,new_longitude);

                if(distanceWithBodyLatLongAndAdharLatLong <=40){
                    const newServiceProviderLatLongData = new service_provider_lat_long({
                        add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
                        mobile_number:service_provider_mobile_number,
                        latitude:new_latitude,
                        longitude: new_longitude,
                        address: newAddress
                    });

                    await newServiceProviderLatLongData.save();
                    const serviceProviderData= await serviceProviderModel.findOne({
                        service_provider_mobile_number:service_provider_mobile_number
                    });

                    serviceProviderData.current_latlong_address= newAddress;
                    serviceProviderData.current_latlong = `${new_latitude},${new_longitude}`;

                    await serviceProviderData.save();

                    const serviceProviderDataX= await serviceProviderModel.findOne({
                        service_provider_mobile_number:service_provider_mobile_number,
                        panel_login: "0"
                    });

                    serviceProviderDataX.panel_login="1";
                    serviceProviderDataX.last_panel_login= new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));

                    await serviceProviderDataX.save();

                    const serviceProviderPanelLoginData = new ServiceProviderPanelLogins({
                        active_status:1,
                        service_provider_mobile_number:service_provider_mobile_number,
                        add_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
                    });
                    await serviceProviderPanelLoginData.save();
                    return res.status(200).json({
                        status_code:200,
                        message: "Service provider successfully login",
                        p_status:true
                    })

                }else{
                    return res.status(200).json({
                        status_code: 200,
                        message: "You are not in a serviceable area.",
                        p_status:false
                    })
                }
            }


        }else{
            const serviceProviderData= await serviceProviderModel.findOne({
                service_provider_mobile_number:service_provider_mobile_number
            });
            serviceProviderData.panel_login= "0";
            await serviceProviderData.save();

            const serviceProviderPanelLoginData = await ServiceProviderPanelLogins.findOne({
                service_provider_mobile_number:service_provider_mobile_number,
                active_status:1
            });
            if(!serviceProviderPanelLoginData){
                return res.status(400).json({status_code:400, message: "serviceProviderPanelLOgin data not found!"})
            }
            serviceProviderPanelLoginData.active_status=0;

            await serviceProviderPanelLoginData.save();

            return res.status(200).json({
                status_code:200,
                message: "Service Provider successfully Logout",
                p_status:false
            })
        }
    } catch (error) {
        console.log("Error in Handling Service Provider Panel Login",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}
// function to find distance bw 2 latlong addresses
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
  
    return distance;
  }

async function buySubscriptionCheck(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;
        const serviceProviderSubscriptionData= await ServiceProviderSubscriptionValidation.findOne({
            service_provider_mobile_number:service_provider_mobile_number
        }).sort({addDate: -1 }).select("end_date");

        if(!serviceProviderSubscriptionData){
            return res.status(400).json({status_code:400, message:"Service Provider Not found with mobile Number"});
        }

        const endDate = new Date(serviceProviderSubscriptionData.end_date);  // Your end_date from the database
        const today = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));  // Current date and time


        today.setHours(0, 0, 0, 0);

        if(today <= endDate){
         return res.status(200).json({
            status_code:200,
            message: "Subscription already Buy",
            redirect: "service-provider-panel"
         })
        }else{
            return res.status(200).json({
                status_code:200,
                message: "Please Subscription Buy",
                redirect: "buy-subscription"
             }) 
        }
    } catch (error) {
        console.log("Error in Buy Subscription Check API",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}
async function serviceProviderBuySubscription(req,res){
    try {
        const service_provider_mobile_number= req.user.mobile;
        const startDate= new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
        const today = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))

        today.setDate(today.getDate() + 30);
        const endDate = today;
        const newServiceProviderSubscriptionData = new ServiceProviderSubscription({
            service_provider_mobile_number:service_provider_mobile_number,
            start_date:startDate,
            end_date:endDate,
            add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
            order_id:"",
            payment_id: ""
        });
        await newServiceProviderSubscriptionData.save();

        const newServiceProviderSubscriptionValidationData= new ServiceProviderSubscriptionValidation({
            service_provider_mobile_number:service_provider_mobile_number,
            start_date:startDate,
            end_date:endDate,
            add_date:new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
            payment_id:"",
            order_id:""
        })
        await newServiceProviderSubscriptionValidationData.save();

        return res.status(200).json({
            status_code:200,
            message: "Subscription buy successfully",
            redirect:"service-provider-panel"
        })
    } catch (error) {
        console.log("Error in Service Provider Buy Subscription",error)
        return res
       .status(500)
       .json({ status_code: 500, message: "Internal server error" });
    }
}
module.exports={
    hanldeServiceProviderNotice,
    hanldeServiceProviderNoticeBoardClicks,
    handleServiceProviderNotification,
    serviceProviderNotificationVideos,
    getServiceProviderProfileInfo,
    serviceProviderPanelLoginStatus,
    serviceProviderClick,
    updateServiceProviderNotificationsStatus,
    handleServiceProviderVideoLibraryClicks,
    handleServiceProviderPanelLogin,
    buySubscriptionCheck,
    serviceProviderBuySubscription
}