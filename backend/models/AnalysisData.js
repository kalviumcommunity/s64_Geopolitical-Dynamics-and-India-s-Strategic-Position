const mongoose = require('mongoose');

// Define schema for analysis data
const analysisDataSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  trade: {
    type: Number,
    required: true
  },
  defense: {
    type: Number,
    required: true
  },
  alliances: {
    type: Number,
    required: true
  }
});

// Create index for faster queries
analysisDataSchema.index({ year: 1 });

module.exports = mongoose.model('AnalysisData', analysisDataSchema);