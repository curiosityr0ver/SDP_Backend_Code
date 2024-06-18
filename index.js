const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const mongoURI = 'mongodb://localhost:27017/sensor_data'; // Replace with your MongoDB connection string

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const SensorDataSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    numDevices: { type: Number, required: true },
    voltage: { type: Number, required: true },
    current: { type: Number, required: true }
});

const SensorData = mongoose.model('SensorData', SensorDataSchema);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('sensorData', (data) => {
        console.log('Received sensor data:', data);

        const newSensorData = new SensorData({
            timestamp: data.timestamp,
            numDevices: data.numDevices,
            voltage: data.voltage,
            current: data.current
        });

        newSensorData.save()
            .then(() => console.log('Sensor data saved to MongoDB'))
            .catch(err => console.error('Error saving data to MongoDB:', err));
    });

    // Upload data to MongoDB every 5 seconds (configurable)
    setInterval(() => {
        // Simulate sensor data for demonstration (replace with actual data fetching logic)
        const sensorData = {
            timestamp: new Date(),
            numDevices: Math.floor(Math.random() * 10) + 1, // Random number of devices
            voltage: Math.random() * 100 + 200, // Random voltage between 200-300
            current: Math.random() * 10 + 2, // Random current between 2-12
        };

        socket.emit('sensorDataUpdate', sensorData); // Emit data to connected clients
    }, 5000);
});

server.listen(3000, () => console.log('Server listening on port 3000'));
