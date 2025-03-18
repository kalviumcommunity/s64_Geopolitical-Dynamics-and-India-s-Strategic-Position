require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding users'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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

// Clear existing users and seed the database
const seedDatabase = async () => {
  try {
    // Remove existing users
    await User.deleteMany({});
    console.log('Cleared existing user data');
    
    // Insert new users
    const result = await User.insertMany(seedUsers);
    console.log(`Successfully seeded ${result.length} user records`);
    
    // Log user IDs for reference (helpful when creating items)
    console.log('User IDs for reference:');
    result.forEach(user => {
      console.log(`${user.username}: ${user._id}`);
    });
    
    // Close the connection when done
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();