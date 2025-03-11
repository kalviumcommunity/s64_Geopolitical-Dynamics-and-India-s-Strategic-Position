require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding entities'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Item schema (replicating it from routes.js)
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create model
const Item = mongoose.model('Item', ItemSchema);

// Define seed data for entities
const seedData = [
  {
    name: 'Quad Alliance',
    description: 'A strategic security dialogue between India, United States, Japan, and Australia that is aimed at ensuring a free, open Indo-Pacific region.'
  },
  {
    name: 'BRICS',
    description: 'An association of five major emerging economies: Brazil, Russia, India, China, and South Africa. India plays a crucial role in this geopolitical group.'
  },
  {
    name: 'Chabahar Port',
    description: 'A key strategic port in Iran that India has helped develop, providing India with sea-land access to Afghanistan and Central Asia, bypassing Pakistan.'
  }
];

// Clear existing data and seed the database
const seedDatabase = async () => {
  try {
    // Remove existing entities
    await Item.deleteMany({});
    console.log('Cleared existing entity items');
    
    // Insert new entities
    const result = await Item.insertMany(seedData);
    console.log(`Successfully seeded ${result.length} entity items`);
    
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