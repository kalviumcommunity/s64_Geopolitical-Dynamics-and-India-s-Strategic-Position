require('dotenv').config();
const { sequelize } = require('../db/config');
const seedUsers = require('./seedMySqlUsers');
const seedItems = require('./seedMySqlItems');

// Initialize MySQL database with sample data
const initializeMySQL = async () => {
  try {
    console.log('Starting MySQL database initialization...');

    // Test database connection
    await sequelize.authenticate();
    console.log('MySQL connection established successfully');

    // Seed users first
    console.log('\n--- SEEDING USERS ---');
    const users = await seedUsers();
    
    // Then seed items
    console.log('\n--- SEEDING ITEMS ---');
    const items = await seedItems();
    
    console.log('\n--- INITIALIZATION COMPLETE ---');
    console.log(`Created ${users.length} users and ${items.length} items`);
    
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');
    
    return { users, items };
  } catch (error) {
    console.error('Error initializing MySQL database:', error);
    process.exit(1);
  }
};

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeMySQL()
    .then(() => {
      console.log('MySQL database initialized successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('MySQL initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initializeMySQL;