const express = require('express');
const mongoose = require('mongoose');
const AnalysisData = require('./models/AnalysisData');

const router = express.Router();

module.exports = (db) => {
    const collection = db.collection('items');

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


    router.get("/data", async (req, res) => {
        const { metric, timeRange } = req.query;
      
        if (!metric || !timeRange) {
          return res.status(400).json({ error: "Missing metric or timeRange" });
        }
      
        const data = generateData(metric, timeRange);
        if (!data) {
          return res.status(404).json({ error: "Invalid metric" });
        }
      
        res.json({ metric, timeRange, data });
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