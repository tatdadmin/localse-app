// models/serviceProviderModel.js
const mongoose = require("mongoose");

const serviceProviderModelSchema = new mongoose.Schema(
  {
    // service_provider_id: { type: String, required: true },
    service_type: { type: String, required: true },
    service_category: { type: String, required: true },
    service_provider_name: { type: String,
      //  required: true
       },
    service_provider_name_hindi: { type: String, default: "" },
    service_provider_name_urdu: { type: String, default: "" },
    service_provider_name_marathi: { type: String, default: "" },
    service_provider_name_tamil: { type: String, default: "" },
    service_provider_name_telugu: { type: String, default: "" },
    service_provider_name_malayalam: { type: String, default: "" },
    service_provider_mobile_number: { type: String, required: true },
    language: { type: String, enum: ['Hindi', 'English'], required: true },
    service_provider_email: { type: String,
      //  required: true
       },
    service_area: { type: String, 
      // required: true
     },
    rating: { type: Number, default: 4.0 },
    agent_rating:{type:Number,default:4.5},
    service_provider_aadhar_number: { type: String, required: true },
    service_provider_image: { type: String, 
      // required: true
     },
    current_latlong_address: { type: String,
      //  required: true
       },
    current_address: { type: String,
      //  required: true
       },
    aadhaar_address: { type: String,
      //  required: true
       },
    aadhaar_address_hindi: { type: String, default: "" },
    aadhaar_address_urdu: { type: String, default: "" },
    aadhaar_address_marathi: { type: String, default: "" },
    aadhaar_address_tamil: { type: String, default: "" },
    aadhaar_address_telugu: { type: String, default: "" },
    aadhaar_address_malayalam: { type: String, default: "" },

    current_latlong: { type: String, 
      // required: true
     },
    current_address_latlong: { type: String,
      //  required: true 
      },
    aadhaar_address_latlong: { type: String,
      //  required: true
       },
    active_status: { type: String, enum: ['1', '0'], default: '1' },
    agent_number: { type: String,
      //  required: true
       },
    panel_login: { type: String, enum: ['0', '1'], required: true },
    last_panel_login: { type: Date,
      //  default: "0000-00-00 00:00:00"
       },
       createdAt: {
        type: Date,
        default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
        immutable: true, // Prevents modification after creation
      },
  },
  { timestamps: false}
);

module.exports = mongoose.model("ServiceProviderModel", serviceProviderModelSchema,"service_provider");
