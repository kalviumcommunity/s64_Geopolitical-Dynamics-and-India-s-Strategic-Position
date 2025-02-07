require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8000;

const client = new MongoClient(process.env.MONGO_URI);

let dbStatus = "Disconnected";

async function connectDB() {
    try {
        await client.connect();
        dbStatus = "Connected to MongoDB";
        console.log(dbStatus);
    } catch (error) {
        dbStatus = "Failed to connect to MongoDB";
        console.error(error);
    }
}
connectDB();

app.get('/', (req, res) => {
    res.send({ status: dbStatus });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});