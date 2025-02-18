const express = require('express');
const router = express.Router();
const serviceProviderService = require('../controllers/ServiceProviderServiceController');

const multer = require('multer');
const path = require('path');
const app= express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,path.join(__dirname, '../uploads/service_providers')
      
    ); 
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname); // Get file extension
    const uniqueName = Math.floor(Math.random() * 9000000000 + 1000000000) + extension;
    cb(null, uniqueName); // Use unique filename
  }
});

const upload = multer({ storage: storage });

router.post('/create-service', serviceProviderService.addServiceProviderService);
router.get('/registration/get_service_type_api', serviceProviderService.getServiceProviderServices);
router.get('/registration/get_localse_services_for_registration', serviceProviderService.searchServiceProviderService);

router.post("/registration/save-service-partner-registration",upload.single('service_provider_image')
,serviceProviderService.saveServicePartnerRegistration);
// need to work upon
router.get("/registration/get_service_localities-api",serviceProviderService.getServiceLocalities);
router.get("/registration/training-api",serviceProviderService.training);
router.post("/authentication/get-app-version-info",serviceProviderService.getAppVersionInfo)

module.exports = router;
