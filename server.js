const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient; // MongoDB driver

const url = 'mongodb+srv://ishu:wFzV5eyvy1tr4IMX@job-listing-db.cxxc1pj.mongodb.net/iot-monitoring?retryWrites=true&w=majority&appName=job-listing-db'; // Replace with your MongoDB connection string
const dbName = 'iot_data';
let dbClient;

// Function to connect to MongoDB
async function connectToDb() {
    try {
        dbClient = await MongoClient.connect(url);
        console.log('Connected to MongoDB!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

async function insertData(data) {
    const db = dbClient.db(dbName);
    const collection = db.collection('sensor_data');
    await collection.insertOne(data);
}

connectToDb();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A device connected');

    socket.on('sensorData', (data) => {
        // Validate data structure and values (optional)

        console.log('Received sensor data:', data);

        // Insert data into MongoDB database
        insertData(data)
            .then(() => console.log('Data inserted into MongoDB'))
            .catch((error) => console.error('Error inserting data:', error));
    });
});

// Set up interval to upload data to MongoDB every 5 seconds
setInterval(() => {
    // Simulate data generation (replace with actual sensor reading logic)
    const timestamp = Date.now();
    const numDevices = Math.floor(Math.random() * 10) + 1;
    const voltage = Math.random() * 10 + 5;
    const current = Math.random() * 2 + 0.5;

    const data = { timestamp, numDevices, voltage, current };
    io.emit('sensorData', data);

    // Insert data into MongoDB
    insertData(data)
        .then(() => console.log('Data inserted into MongoDB (interval)'))
        .catch((error) => console.error('Error inserting data:', error));
}, 5000);

// Start the server
http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
