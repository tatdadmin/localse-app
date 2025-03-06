const mongoose = require('mongoose');

const agentConversionSchema = new mongoose.Schema({
    add_date: { type: Date, default: Date.now },
    agent_name: { type: String, required: true },
    agent_number: { type: String, required: true },
    service_provider_name: { type: String, required: true },
    service_provider_mobile_number: { type: String, required: true },
    amount_received: { type: Number, required: true },
    commission_layer: { type: String, required: true },
    commission_percent: { type: Number, required: true },
    commission_value: { type: Number, required: true },
    payment_status: { type: String, enum: ['Due', 'Paid'], default: 'Due' },
    payment_status_date: { type: Date }
}, { collection: 'agent_conversion' });

const AgentConversion = mongoose.model('AgentConversion', agentConversionSchema);

module.exports = AgentConversion;
