require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // Allow all origins (you can specify specific origins if needed)
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mydatabase';

// Middleware to handle CORS
app.use(cors());

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
    voltage: String,
    current: String,
    devices: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Array to hold incoming data
let messageBuffer = [];

// Function to save buffered messages to the database
const saveBufferedMessages = async () => {
    if (messageBuffer.length > 0) {
        try {
            await Message.insertMany(messageBuffer);
            console.log(`Saved ${messageBuffer.length} messages to the database.`);
            messageBuffer = [];
        } catch (error) {
            console.error('Error saving messages to the database:', error);
        }
    }
};

// Set interval to save buffered messages every 5 seconds
setInterval(saveBufferedMessages, 5000);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('data', (data) => {
        console.log('Received data:', data);
        messageBuffer.push(data);
        io.emit('data', data);  // Broadcast to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});