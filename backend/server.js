require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        app.use('/api', routes());

        app.get('/', (req, res) => {
            res.send('API is running...');
        });

        app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
}

startServer();