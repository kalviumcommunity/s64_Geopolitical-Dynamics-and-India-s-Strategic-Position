const { sequelize } = require('../config');
const User = require('./User');
const Item = require('./Item');

// Export all models and the Sequelize instance
module.exports = {
  sequelize,
  User,
  Item
};