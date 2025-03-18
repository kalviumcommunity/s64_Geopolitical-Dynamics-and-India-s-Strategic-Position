require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding items'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Item schema (matching the one in routes.js)
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', ItemSchema);

// Seed the database with sample items
const seedItems = async () => {
  try {
    // First, get all users to reference in the items
    const users = await User.find();
    
    if (users.length === 0) {
      console.error('No users found. Please run seedUsers.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users for item creation`);
    
    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');
    
    // Create sample items with user assignments
    const sampleItems = [
      {
        name: 'Security Framework Analysis',
        description: 'Comprehensive analysis of India\'s security framework and strategic partnerships in the Indo-Pacific region.',
        created_by: users[0]._id
      },
      {
        name: 'Trade Corridor Initiative',
        description: 'Proposal for new trade corridors connecting India with Central Asia and Europe through strategic partnerships.',
        created_by: users[0]._id
      },
      {
        name: 'Energy Security Report',
        description: 'Assessment of India\'s energy security challenges and opportunities in a changing geopolitical landscape.',
        created_by: users[1]._id
      },
      {
        name: 'Maritime Strategy Document',
        description: 'Analysis of India\'s evolving maritime strategy in response to regional security dynamics.',
        created_by: users[2]._id
      },
      {
        name: 'Diplomatic Engagement Plan',
        description: 'Strategic roadmap for diplomatic engagement with key partners in South Asia and beyond.',
        created_by: users[2]._id
      },
      {
        name: 'Economic Partnership Framework',
        description: 'Framework for deepening economic partnerships with strategic allies in the Indo-Pacific.',
        created_by: users[3]._id
      }
    ];
    
    // Insert sample items
    const result = await Item.insertMany(sampleItems);
    console.log(`Successfully created ${result.length} items with user assignments`);
    
    // Display created items with their user assignments
    console.log('Items created:');
    for (const item of result) {
      const user = users.find(u => u._id.toString() === item.created_by.toString());
      console.log(`- ${item.name} (created by: ${user.username})`);
    }
    
    // Close the connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding items:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedItems();