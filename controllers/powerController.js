const PowerConsumption = require('../models/PowerConsumption');

const savePowerData = async (data) => {
    try {
        const powerData = new PowerConsumption({
            sensorId: data.sensorId,
            power: data.power,
        });
        await powerData.save();
        console.log('Power data saved:', powerData);
    } catch (err) {
        console.error('Error saving power data:', err.message);
    }
};

module.exports = {
    savePowerData,
};
