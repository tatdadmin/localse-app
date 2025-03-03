const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for localse_dictionary
const localseDictionarySchema = new Schema(
  {
    add_date: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000), // Default to IST time
    },
    subject: { type: String, default: "" },
    content: { type: String, default: "" },
    subject_hindi: { type: String, default: "" },
    content_hindi: { type: String, default: "" },
    subject_urdu: { type: String, default: "" },
    content_urdu: { type: String, default: "" },
    subject_marathi: { type: String, default: "" },
    content_marathi: { type: String, default: "" },
    subject_telugu: { type: String, default: "" },
    content_telugu: { type: String, default: "" },
    subject_malayalam: { type: String, default: "" },
    content_malayalam: { type: String, default: "" },
    subject_tamil: { type: String, default: "" },
    content_tamil: { type: String, default: "" },    
  },
  {
    collection: 'localse_dictionary', // MongoDB collection name
    timestamps: false, // Avoid automatic createdAt and updatedAt fields
  }
);

// Create the model
const LocalseDictionary = mongoose.model('LocalseDictionary', localseDictionarySchema);

module.exports = LocalseDictionary;
