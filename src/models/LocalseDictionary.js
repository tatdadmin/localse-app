const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for localse_dictionary
const localseDictionarySchema = new Schema(
  {
    add_date: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000), // Default to IST time
    },
    subjectEnglish: { type: String, default: "" },
    contentEnglish: { type: String, default: "" },
    subjectHindi: { type: String, default: "" },
    contentHindi: { type: String, default: "" },
    subjectUrdu: { type: String, default: "" },
    contentUrdu: { type: String, default: "" },
    subjectMarathi: { type: String, default: "" },
    contentMarathi: { type: String, default: "" },
    subjectTelugu: { type: String, default: "" },
    contentTelugu: { type: String, default: "" },
    subjectMalayalam: { type: String, default: "" },
    contentMalayalam: { type: String, default: "" },
    subjectTamil: { type: String, default: "" },
    contentTamil: { type: String, default: "" },
  },
  {
    collection: 'localse_dictionary', // MongoDB collection name
    timestamps: false, // Avoid automatic createdAt and updatedAt fields
  }
);

// Create the model
const LocalseDictionary = mongoose.model('LocalseDictionary', localseDictionarySchema);

module.exports = LocalseDictionary;
