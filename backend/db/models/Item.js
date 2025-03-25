const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

// Define Item model with Sequelize
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // Define table configuration
  tableName: 'strategic_items', // Changed from 'items' to avoid foreign key constraints
  timestamps: true,
  updatedAt: false // Only track creation time
});

module.exports = Item;