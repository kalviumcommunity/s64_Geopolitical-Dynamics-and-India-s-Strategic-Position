const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

module.exports = (db) => {
    const collection = db.collection('items');

    // Create
    router.post('/items', async (req, res) => {
        try {
            const result = await collection.insertOne(req.body);
            res.status(201).json({ message: 'Item created', item: { _id: result.insertedId, ...req.body } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Read All
    router.get('/items', async (req, res) => {
        try {
            const items = await collection.find().toArray();
            if (!items.length) {
                return res.status(404).json({ message: 'No items found' });
            }
            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Read by ID
    router.get('/items/:id', async (req, res) => {
        try {
            const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update
    router.put('/items/:id', async (req, res) => {
        try {
            const result = await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item updated', result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete
    router.delete('/items/:id', async (req, res) => {
        try {
            const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};