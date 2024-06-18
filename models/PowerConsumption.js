const mongoose = require('mongoose');

const PowerConsumptionSchema = new mongoose.Schema({
    sensorId: {
        type: String,
        required: true,
    },
    power: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PowerConsumption', PowerConsumptionSchema);
