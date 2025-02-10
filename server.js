require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8000;

const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbStatus = 'Disconnected';

async function connectDB() {
    try {
        await client.connect();
        dbStatus = 'Connected';
        console.log('MongoDB Connected');
    } catch (error) {
        dbStatus = 'Error';
        console.error('MongoDB Connection Error:', error);
    }
}
connectDB();

app.get('/', (req, res) => {
    res.send(`Database Status: ${dbStatus}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));