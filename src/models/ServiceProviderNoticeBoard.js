const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const serviceProviderNoticeBoardSchema = new Schema(
  {
    subject: { type: String, required: true },               // Subject of the notification
    content: { type: String, required: true },               // Content of the notification
    subject_hindi: { type: String, default: '' },
    content_hindi: { type: String, default: '' },
    subject_urdu: { type: String, default: '' },
    content_urdu: { type: String, default: '' },
    subject_marathi: { type: String, default: '' },
    content_marathi: { type: String, default: '' },
    subject_tamil: { type: String, default: '' },
    content_tamil: { type: String, default: '' },
    subject_telugu: { type: String, default: '' },
    content_telugu: { type: String, default: '' },
    subject_malayalam: { type: String, default: '' },
    content_malayalam: { type: String, default: '' },
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
