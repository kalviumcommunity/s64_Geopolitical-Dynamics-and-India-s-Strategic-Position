const express = require('express');
const mongoose = require('mongoose');
const AnalysisData = require('./models/AnalysisData');

const router = express.Router();

// Create a simple Item model for the items API
const ItemSchema = new mongoose.Schema({
    name: String,
    description: String,
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
            res.status(500).json({ error: error.message });
        }
    });

    // Read All items using Mongoose
    router.get('/items', async (req, res) => {
        try {
            console.log('Fetching all items');
            const items = await Item.find().sort({ createdAt: -1 });
            console.log(`Found ${items.length} items`);
            res.status(200).json(items);
        } catch (error) {
            console.error('Error fetching items:', error);
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
            const item = await Item.findById(req.params.id);
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
                { new: true }
            );
            if (!updatedItem) {
                console.log('Item not found for update');
                return res.status(404).json({ message: 'Item not found' });
            }
            console.log('Item updated:', updatedItem);
            res.status(200).json({ message: 'Item updated', item: updatedItem });
        } catch (error) {
            console.error('Error updating item:', error);
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