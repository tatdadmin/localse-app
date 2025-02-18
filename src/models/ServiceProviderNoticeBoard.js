const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const serviceProviderNoticeBoardSchema = new Schema(
  {
    subjectHindi: { type: String, required: true },
    contentHindi: { type: String, required: true },
    subjectEnglish: { type: String, required: true },
    contentEnglish: { type: String, required: true },
    addDate: { type: Date, default: Date.now },
    activeStatus: { type: Boolean, default: true }
  },
  {
    collection: 'service_provider_notice_board', // specify the MongoDB collection name
    timestamps: false // to avoid Mongoose automatically adding createdAt and updatedAt fields
  }
);

// Create the model
const ServiceProviderNoticeBoard = mongoose.model('ServiceProviderNoticeBoard', serviceProviderNoticeBoardSchema);

module.exports = ServiceProviderNoticeBoard;
