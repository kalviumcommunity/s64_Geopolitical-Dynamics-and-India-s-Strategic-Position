require('dotenv').config();
const mongoose = require('mongoose');
const AnalysisData = require('../models/AnalysisData');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define seed data - 10 years of data for each metric
const currentYear = new Date().getFullYear();
const seedData = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - 9 + i;
  
  // Create realistic growth patterns
  // Trade: gradual increase with a dip in the middle (global economic slowdown)
  // Defense: steady increase (security concerns)
  // Alliances: slow but steady growth with small fluctuations
  
  let trade, defense, alliances;
  
  // Trade growth (%) - base value + growth + (realistic fluctuations)
  trade = 50 + (i * 5) + (i === 3 || i === 4 ? -10 : 0);
  
  // Defense budget ($B) - starting at $20B with steady increases
  defense = 20 + (i * 2.5);
  
  // Strategic alliances - small base with incremental increase
  alliances = 5 + (i * 0.8);
  
  return {
    year,
    trade,
    defense,
    alliances
  };
});

// Clear existing data and seed the database
const seedDatabase = async () => {
  try {
    // Remove existing data
    await AnalysisData.deleteMany({});
    console.log('Cleared existing analysis data');
    
    // Insert new data
    const result = await AnalysisData.insertMany(seedData);
    console.log(`Successfully seeded ${result.length} analysis data records`);
    
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