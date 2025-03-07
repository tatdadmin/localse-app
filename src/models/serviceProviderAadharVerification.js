const mongoose = require('mongoose');

const AadharVerificationSchema = new mongoose.Schema({
    add_date: { type: Date,
        default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
        //  default: Date.now
         },
    mobile_number: { type: String, required: false },
    aadhaar_number: { type: String, required: true },
    ad_client_id: { type: String, required: true },
    ad_full_name: { type: String, required: true },
    ad_dob: { type: String, required: true },
    ad_gender: { type: String, required: true },
    ad_address_country: { type: String, default: '' },
    ad_address_distic: { type: String, default: '' },
    ad_address_state: { type: String, default: '' },
    ad_address_po: { type: String, default: '' },
    ad_address_location: { type: String, default: '' },
    ad_address_vtc: { type: String, default: '' },
    ad_address_subdist: { type: String, default: '' },
    ad_address_street: { type: String, default: '' },
    ad_address_house: { type: String, default: '' },
    ad_address_landmark: { type: String, default: '' },
    ad_face_status: { type: String, default: '' },
    ad_face_score: { type: String, default: '' },
    ad_zip: { type: String, default: '' },
    ad_profile_image: { type: String, default: '' },
    ad_has_image: { type: String, default: '' },
    ad_email_hash: { type: String, default: '' },
    ad_mobile_hash: { type: String, default: '' },
    ad_raw_xml: { type: String, default: '' },
    ad_zip_data: { type: String, default: '' },
    ad_care_of: { type: String, default: '' },
    ad_share_code: { type: String, default: '' },
    ad_mobile_verified: { type: String, default: '' },
    ad_reference_id: { type: String, default: '' },
    ad_aadhaar_pdf: { type: String, default: '' },
    ad_status: { type: String, default: '' },
    ad_uniqueness_id: { type: String, default: '' },
    ad_status_code: { type: String, default: '' },
    ad_success: { type: Boolean, default: false },
    ad_message: { type: String, default: '' },
    ad_message_code: { type: String, default: '' }
});

module.exports = mongoose.model('ServiceProviderAadharVerification', AadharVerificationSchema,"service_provider_aadhar_verification");
