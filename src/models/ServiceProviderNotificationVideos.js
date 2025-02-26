const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for service_provider_notifications_videos
const serviceProviderNotificationsVideosSchema = new Schema(
  {
    subject: { type: String, required: true, maxlength: 100 }, // Subject of the video notification
    video_id: { type: Number, required: true },                // ID of the video
    video_url: { type: String, required: true },                // URL of the video
    video_language: { type: String, enum: ['Hindi', 'English'], required: true }, // Language of the video
    service_provider_mobile_number: { type: String, required: true, maxlength: 10 }, // Mobile number of the service provider
    from: { type: String, required: true },                    // Sender of the video notification
    view_status: { type: String,
        //  enum: ['0', '1'],
          default: '0' }, // View status (0 for not viewed, 1 for viewed)
    add_date: { type: Date,
      default: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
      //  default: Date.now
       }                 // Timestamp of when the video notification was added
  },
  {
    collection: 'service_provider_notifications_videos', // MongoDB collection name
    timestamps: false  // Disable automatic createdAt and updatedAt fields
  }
);

// Create the model
const ServiceProviderNotificationsVideos = mongoose.model('ServiceProviderNotificationsVideos', serviceProviderNotificationsVideosSchema);

module.exports = ServiceProviderNotificationsVideos;
