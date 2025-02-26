const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const serviceProviderNoticeBoardSchema = new Schema(
  {
    subjectHindi: { type: String, required: true },
    contentHindi: { type: String, required: true },
    subjectEnglish: { type: String, required: true },
    contentEnglish: { type: String, required: true },
    addDate: { type: Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      //  default: Date.now 
      },
    activeStatus: { type: Boolean, default: true },
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
      immutable: true, // Prevents modification after creation
    },
  },
  {
    collection: 'service_provider_notice_board', // specify the MongoDB collection name
    timestamps: false // to avoid Mongoose automatically adding createdAt and updatedAt fields
  }
);

// Create the model
const ServiceProviderNoticeBoard = mongoose.model('ServiceProviderNoticeBoard', serviceProviderNoticeBoardSchema);

module.exports = ServiceProviderNoticeBoard;
