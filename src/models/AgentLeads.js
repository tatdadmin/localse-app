const mongoose = require("mongoose");

const agentLeadsSchema = new mongoose.Schema(
  {
    add_date: { 
      type: Date, 
      default: Date.now 
    },
    agent_number: { 
      type: String, 
      required: true 
    },
    service_provider_mobile_number: { 
      type: String, 
      required: true 
    },
    active_status: { 
      type: String, 
      enum: ['1', '0'], 
      default: '1' 
    },
    registered: { 
      type: String, 
      enum: ['1', '0'], 
      required: true, 
      default: '0' 
    }
  },
  { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
);

module.exports = mongoose.model("AgentLeads", agentLeadsSchema);
