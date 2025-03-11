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
    // Fetch analysis data with filtering by time range and metric
    router.get('/analysis', async (req, res) => {
        try {
            const { timeRange = 'decade', metric = 'trade' } = req.query;
            
            // Calculate the number of years to look back based on time range
            const yearsToLookBack = timeRange === 'decade' ? 10 : 5;
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - yearsToLookBack;
            
            // Query MongoDB for filtered data
            const data = await AnalysisData.find({ 
                year: { $gte: startYear } 
            }).sort({ year: 1 });
            
            if (!data.length) {
                return res.status(404).json({ 
                    message: 'No analysis data found for the specified time range' 
                });
            }
            
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching analysis data:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Create item using Mongoose
    router.post('/items', async (req, res) => {
        try {
            const newItem = new Item(req.body);
            const savedItem = await newItem.save();
            res.status(201).json({ message: 'Item created', item: savedItem });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Read All items using Mongoose
    router.get('/items', async (req, res) => {
        try {
            const items = await Item.find();
            if (!items.length) {
                return res.status(404).json({ message: 'No items found' });
            }
            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Read item by ID using Mongoose
    router.get('/items/:id', async (req, res) => {
        try {
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update item using Mongoose
    router.put('/items/:id', async (req, res) => {
        try {
            const updatedItem = await Item.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!updatedItem) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item updated', item: updatedItem });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete item using Mongoose
    router.delete('/items/:id', async (req, res) => {
        try {
            const deletedItem = await Item.findByIdAndDelete(req.params.id);
            if (!deletedItem) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};