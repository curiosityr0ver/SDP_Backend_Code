const Message = require('../models/Message');

const getOptimalSchedule = async (req, res) => {
    try {
        const taskDuration = parseInt(req.query.taskDuration) || 3; // Task duration in intervals (default to 3 intervals)
        const carbonFootprintData = await Message.find().sort({ timestamp: 1 }).lean();

        if (carbonFootprintData.length < taskDuration) {
            return res.status(400).json({ error: 'Not enough data points to calculate optimal schedule.' });
        }

        const findOptimalSchedule = (data, duration) => {
            let minCarbonFootprint = Infinity;
            let optimalStartIndex = null;

            for (let i = 0; i <= data.length - duration; i++) {
                let totalCarbonFootprint = 0;

                for (let j = 0; j < duration; j++) {
                    totalCarbonFootprint += parseFloat(data[i + j].voltage) * parseFloat(data[i + j].current);
                }

                if (totalCarbonFootprint < minCarbonFootprint) {
                    minCarbonFootprint = totalCarbonFootprint;
                    optimalStartIndex = i;
                }
            }

            return {
                start: data[optimalStartIndex].timestamp,
                end: data[optimalStartIndex + duration - 1].timestamp
            };
        };

        const optimalSchedule = findOptimalSchedule(carbonFootprintData, taskDuration);
        res.json({ carbonFootprintData, optimalSchedule });
    } catch (error) {
        console.error('Error calculating optimal schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getOptimalSchedule,
};
