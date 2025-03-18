const express = require('express');
const mongoose = require('mongoose');
const AnalysisData = require('./models/AnalysisData');
const User = require('./models/User');

const router = express.Router();

// Create a simple Item model for the items API
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = () => {
    // API test endpoint to verify server is running
    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', message: 'API is running' });
    });

    // Create item using Mongoose
    router.post('/items', async (req, res) => {
        try {
            const newItem = new Item(req.body);
            const savedItem = await newItem.save();
            console.log('Item created:', savedItem);
            res.status(201).json({ message: 'Item created', item: savedItem });
        } catch (error) {
            console.error('Error creating item:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                
                // Extract validation error messages
                for (const field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    validationErrors 
                });
            }
            
            res.status(500).json({ error: error.message });
        }
    });

    // Read All items using Mongoose with optional user filtering
    router.get('/items', async (req, res) => {
        try {
            const { created_by } = req.query;
            console.log(`Fetching items${created_by ? ` for user: ${created_by}` : ''}`);
            
            // Build query based on whether a user filter was provided
            const query = created_by ? { created_by } : {};
            
            const items = await Item.find(query)
                .populate('created_by', 'username email')
                .sort({ createdAt: -1 });
                
            console.log(`Found ${items.length} items`);
            res.status(200).json(items);
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get all users for dropdown
    router.get('/users', async (req, res) => {
        try {
            console.log('Fetching all users');
            const users = await User.find({}, 'username email');
            console.log(`Found ${users.length} users`);
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Fetch analysis data with filtering by time range and metric
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

    // Read item by ID using Mongoose
    router.get('/items/:id', async (req, res) => {
        try {
            console.log(`Fetching item with ID: ${req.params.id}`);
            const item = await Item.findById(req.params.id).populate('created_by', 'username email');
            if (!item) {
                console.log('Item not found');
                return res.status(404).json({ message: 'Item not found' });
            }
            console.log('Item found:', item);
            res.status(200).json(item);
        } catch (error) {
            console.error('Error fetching item by ID:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Update item using Mongoose
    router.put('/items/:id', async (req, res) => {
        try {
            console.log(`Updating item with ID: ${req.params.id}`);
            const updatedItem = await Item.findByIdAndUpdate(
                req.params.id,
                req.body,
                { 
                    new: true, 
                    runValidators: true // Enable validation for updates
                }
            );
            if (!updatedItem) {
                console.log('Item not found for update');
                return res.status(404).json({ message: 'Item not found' });
            }
            console.log('Item updated:', updatedItem);
            res.status(200).json({ message: 'Item updated', item: updatedItem });
        } catch (error) {
            console.error('Error updating item:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                
                // Extract validation error messages
                for (const field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    validationErrors 
                });
            }
            
            res.status(500).json({ error: error.message });
        }
    });

    // Delete item using Mongoose
    router.delete('/items/:id', async (req, res) => {
        try {
            console.log(`Deleting item with ID: ${req.params.id}`);
            const deletedItem = await Item.findByIdAndDelete(req.params.id);
            if (!deletedItem) {
                console.log('Item not found for deletion');
                return res.status(404).json({ message: 'Item not found' });
            }
            console.log('Item deleted:', deletedItem);
            res.status(200).json({ message: 'Item deleted' });
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};