require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function startServer() {
    try {
        await client.connect();
        const db = client.db('testdb');
        console.log('MongoDB Connected');

        app.use('/api', routes(db));

        app.get('/', (req, res) => {
            res.send('API is running...');
        });

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
}

startServer();