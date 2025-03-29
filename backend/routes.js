const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const AnalysisData = require('./models/AnalysisData'); // Keep MongoDB model for analysis data
const router = express.Router();

// Import Sequelize models and configured instance
const { Item, User } = require('./db/models'); // Import User model for authentication
const { sequelize } = require('./db/config');
const { Op } = require('sequelize');

// JWT secret key - in production, use environment variables
const JWT_SECRET = 'your-jwt-secret-key'; // TODO: Move to environment variables

module.exports = () => {
    // JWT-based authentication routes
    router.post('/auth/login', (req, res) => {
        try {
            const { username } = req.body;
            
            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }
            
            console.log(`Generating JWT token for user: ${username}`);
            
            // Create JWT token with username
            const token = jwt.sign(
                { username: username },
                JWT_SECRET,
                { expiresIn: '24h' } // Token expires in 24 hours
            );
            
            // Set token in cookie
            res.cookie('token', token, { 
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production' // Use secure in production
            });
            
            console.log(`JWT token cookie set successfully for: ${username}`);
            res.status(200).json({ 
                message: 'Login successful',
                username: username
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    router.post('/auth/logout', (req, res) => {
        try {
            // Clear the JWT token cookie
            res.clearCookie('token');
            
            console.log('User logged out successfully');
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // User profile endpoint - returns user info from token
    router.get('/auth/me', (req, res) => {
        try {
            const token = req.cookies.token;
            
            if (!token) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            
            // Verify and decode the token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Return user info from token
            res.status(200).json({
                username: decoded.username
            });
        } catch (error) {
            console.error('Error getting user profile:', error);
            // Clear invalid token
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                res.clearCookie('token');
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            res.status(500).json({ error: error.message });
        }
    });
    // Middleware to verify JWT token
    const verifyToken = (req, res, next) => {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Set user info from token
            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification error:', error);
            // Clear invalid token
            res.clearCookie('token');
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    };
    
    // Example of a protected route using the verifyToken middleware
    // Uncomment and use for routes that require authentication
    // router.get('/protected-route', verifyToken, (req, res) => {
    //     res.status(200).json({ 
    //         message: 'This is a protected route',
    //         user: req.user
    //     });
    // });
    // API test endpoint to verify server is running
    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', message: 'API is running' });
    });

    // Create item using Sequelize
    router.post('/items', async (req, res) => {
        try {
            const newItem = await Item.create(req.body);
            console.log('Item created with Sequelize:', newItem.toJSON());
            
            res.status(201).json({ 
                message: 'Item created', 
                item: newItem 
            });
        } catch (error) {
            console.error('Error creating item:', error);
            console.error('Error details:', error.message);
            
            // Handle validation errors
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
                const validationErrors = {};
                
                // Extract validation error messages
                error.errors.forEach((err) => {
                    validationErrors[err.path] = err.message;
                    console.error(`Validation error in field '${err.path}': ${err.message}`);
                });
                
                console.error('Request body was:', req.body);
                
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    validationErrors 
                });
            }
            
            res.status(500).json({ error: error.message });
        }
    });

    // Read All items using Sequelize with optional creator filtering
    router.get('/items', async (req, res) => {
        try {
            const { created_by } = req.query;
            console.log(`Fetching items${created_by ? ` for creator: ${created_by}` : ''}`);
            
            // Build query based on whether a creator filter was provided
            const query = created_by ? 
                { where: { created_by } } : 
                {};
            
            query.order = [['createdAt', 'DESC']];
            
            const items = await Item.findAll(query);
            
            console.log(`Found ${items.length} items`);
            res.status(200).json(items);
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get all unique creators for the dropdown - simplified SQL approach
    router.get('/creators', async (req, res) => {
        try {
            console.log('Fetching all unique creators');
            
            // Direct SQL query approach - simpler and more reliable
            // Updated to use the new 'strategic_items' table name
            const result = await sequelize.query(
                'SELECT DISTINCT created_by FROM strategic_items WHERE created_by IS NOT NULL ORDER BY created_by ASC',
                { type: sequelize.QueryTypes.SELECT }
            );
            
            // Extract just the creator names from the result
            const creatorList = result.map(item => item.created_by);
            
            console.log(`Found ${creatorList.length} unique creators`);
            res.status(200).json(creatorList);
        } catch (error) {
            console.error('Error fetching creators:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Fetch analysis data with filtering by time range and metric (using MongoDB)
    router.get('/analysis', async (req, res) => {
        try {
            const { timeRange = 'decade', metric = 'trade' } = req.query;
            console.log(`Fetching analysis data: timeRange=${timeRange}, metric=${metric}`);
            
            // Calculate the number of years to look back based on time range
            const yearsToLookBack = timeRange === 'decade' ? 10 : 5;
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - yearsToLookBack;
            
            // Query MongoDB for filtered data
            const data = await AnalysisData.find({ 
                year: { $gte: startYear } 
            }).sort({ year: 1 });
            
            if (!data.length) {
                console.log('No analysis data found');
                return res.status(404).json({ 
                    message: 'No analysis data found for the specified time range' 
                });
            }
            
            console.log(`Found ${data.length} analysis data records`);
            
            // Transform data to focus on the requested metric
            // This ensures the data structure is optimized for the frontend
            const formattedData = data.map(item => ({
                year: item.year,
                [metric]: item[metric]
            }));
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.error('Error fetching analysis data:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Read item by ID using Sequelize
    router.get('/items/:id', async (req, res) => {
        try {
            console.log(`Fetching item with ID: ${req.params.id}`);
            const item = await Item.findByPk(req.params.id);
            
            if (!item) {
                console.log('Item not found');
                return res.status(404).json({ message: 'Item not found' });
            }
            
            console.log('Item found:', item.toJSON());
            res.status(200).json(item);
        } catch (error) {
            console.error('Error fetching item by ID:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Update item using Sequelize
    router.put('/items/:id', async (req, res) => {
        try {
            console.log(`Updating item with ID: ${req.params.id}`);
            
            // Find the item by ID
            const item = await Item.findByPk(req.params.id);
            
            if (!item) {
                console.log('Item not found for update');
                return res.status(404).json({ message: 'Item not found' });
            }
            
            // Update the item
            await item.update(req.body);
            
            // Fetch the updated item
            const updatedItem = await Item.findByPk(req.params.id);
            
            console.log('Item updated:', updatedItem.toJSON());
            res.status(200).json({ message: 'Item updated', item: updatedItem });
        } catch (error) {
            console.error('Error updating item:', error);
            
            // Handle validation errors
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = {};
                
                // Extract validation error messages
                error.errors.forEach((err) => {
                    validationErrors[err.path] = err.message;
                });
                
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    validationErrors 
                });
            }
            
            res.status(500).json({ error: error.message });
        }
    });

    // Delete item using Sequelize
    router.delete('/items/:id', async (req, res) => {
        try {
            console.log(`Deleting item with ID: ${req.params.id}`);
            
            // Find the item to delete
            const item = await Item.findByPk(req.params.id);
            
            if (!item) {
                console.log('Item not found for deletion');
                return res.status(404).json({ message: 'Item not found' });
            }
            
            // Store item info for response
            const deletedItemInfo = item.toJSON();
            
            // Delete the item
            await item.destroy();
            
            console.log('Item deleted:', deletedItemInfo);
            res.status(200).json({ message: 'Item deleted', item: deletedItemInfo });
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};