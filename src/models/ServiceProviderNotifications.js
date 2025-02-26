const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for service_provider_notifications
const serviceProviderNotificationsSchema = new Schema(
  {
    subject: { type: String, required: true },               // Subject of the notification
    content: { type: String, required: true },               // Content of the notification
    subjectHindi:{type:String,default:''},
    contentHindi:{type:String,default:''},
    subjectUrdu:{type:String,default:''},
    contentUrdu:{type:String,default:''},
    subjectMarathi:{type:String,default:''},
    contentMarathi:{type:String,default:''},
    subjectTamil:{type:String,default:''},
    contentTamil:{type:String,default:''},
    subjectTelugu:{type:String,default:''},
    contentTelugu:{type:String,default:''},
    subjectMalayalam:{type:String,default:''},
    contentMalayalam:{type:String,default:''},
    service_provider_mobile_number: { type: String, required: true, maxlength: 10 },  // Mobile number of the service provider
    from: { type: String, required: true },                  // Sender of the notification
    readStatus: { type: String, enum: ['0', '1'], default: '0' },  // Read status ('0' for unread, '1' for read)
    addDate: { type: Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      //  default: Date.now 
      },              // Timestamp of when the notification was added
      createdAt: {
        type: Date,
        default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
        immutable: true, // Prevents modification after creation
      },
  },
  {
    collection: 'service_provider_notifications',  // Name of the MongoDB collection
    timestamps: false  // Disable automatic createdAt and updatedAt fields
  }
);

// Create the model
const ServiceProviderNotifications = mongoose.model('ServiceProviderNotifications', serviceProviderNotificationsSchema);

module.exports = ServiceProviderNotifications;
