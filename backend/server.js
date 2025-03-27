require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, testConnection } = require('./db/config');
const models = require('./db/models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware for authentication

async function startServer() {
    try {
        // Connect to MongoDB (for backward compatibility)
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
        
        // Connect to MySQL using Sequelize
        const mysqlConnected = await testConnection();
        if (mysqlConnected) {
            // Synchronize Sequelize models with the database and alter tables to match model definitions
            // This creates tables if they don't exist and modifies existing tables to match our models
            console.log('Synchronizing database tables and updating schema...');
            await sequelize.sync({ alter: true });
            console.log('Database tables synchronized and schema updated successfully');
            console.log('Sequelize models ready');
        } else {
            console.warn('MySQL connection failed, falling back to MongoDB only');
        }

        // Initialize API routes
        app.use('/api', routes());

        app.get('/', (req, res) => {
            res.send('API is running...');
        });

        app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
    } catch (error) {
        console.error('Server startup error:', error);
    }
}

startServer();