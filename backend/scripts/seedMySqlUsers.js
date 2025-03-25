require('dotenv').config();
const { User } = require('../db/models');
const { sequelize } = require('../db/config');

// Define seed data for users
const seedUsers = [
  {
    username: 'admin',
    email: 'admin@example.com'
  },
  {
    username: 'researcher',
    email: 'researcher@example.com'
  },
  {
    username: 'analyst',
    email: 'analyst@example.com'
  },
  {
    username: 'editor',
    email: 'editor@example.com'
  }
];

// Seed the database with users
const seedDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');
    
    // Sync the User model with the database
    await User.sync({ force: true });
    console.log('User table created or replaced');
    
    // Insert users
    const createdUsers = await User.bulkCreate(seedUsers);
    
    console.log(`Successfully seeded ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (ID: ${user.id}, Email: ${user.email})`);
    });
    
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// If this script is run directly (not imported), execute the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('User seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('User seeding failed:', err);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = seedDatabase;
}