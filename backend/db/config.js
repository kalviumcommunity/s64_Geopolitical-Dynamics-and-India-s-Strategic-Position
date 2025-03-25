const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with MySQL connection parameters
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Function to test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to MySQL database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};