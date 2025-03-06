const mongoose = require('mongoose');

const agentLeadSchema = new mongoose.Schema({
    add_date: {
      type: Date,
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000), // Setting default time in IST
    },
    agent_name: { type: String, required: true },
    agent_number: { type: String, required: true },
    service_provider_mobile_number: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      trim: true, // Ensures no extra spaces are stored
      },
    status: { 
        type: String, 
        enum: ['Lead', 'Registered', 'Deleted'], 
        default: 'Lead' 
    },
    status_id: { 
        type: String, 
        enum: ["0", "1", "2"], 
        default: "0" 
    },
    updated_at: { type: Date, default: null }
}, { collection: 'agent_leads' }
);

const AgentLead = mongoose.model('AgentLead', agentLeadSchema);

module.exports = AgentLead;