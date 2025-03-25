require('dotenv').config();
const { Item } = require('../db/models');
const { sequelize } = require('../db/config');

// Sample data for items
const sampleItems = [
  {
    name: 'Security Framework Analysis',
    description: 'Comprehensive analysis of India\'s security framework and strategic partnerships in the Indo-Pacific region.',
    created_by: 'admin'
  },
  {
    name: 'Trade Corridor Initiative',
    description: 'Proposal for new trade corridors connecting India with Central Asia and Europe through strategic partnerships.',
    created_by: 'analyst'
  },
  {
    name: 'Energy Security Report',
    description: 'Assessment of India\'s energy security challenges and opportunities in a changing geopolitical landscape.',
    created_by: 'researcher'
  },
  {
    name: 'Maritime Strategy Document',
    description: 'Analysis of India\'s maritime strategy in the Indian Ocean Region and its implications for regional stability.',
    created_by: 'admin'
  },
  {
    name: 'Defense Technology Roadmap',
    description: 'Strategic roadmap for India\'s defense technology development and international partnerships.',
    created_by: 'analyst'
  },
  {
    name: 'Climate Diplomacy Initiative',
    description: 'Framework for India\'s climate diplomacy approach in bilateral and multilateral forums.',
    created_by: 'editor'
  }
];

/**
 * Seed the MySQL database with sample items
 */
const seedItems = async () => {
  try {
    console.log('Seeding MySQL database with items...');
    
    // Clear existing items
    await Item.destroy({ where: {} });
    console.log('Cleared existing items');
    
    // Insert new items
    const createdItems = await Item.bulkCreate(sampleItems);
    console.log(`Created ${createdItems.length} sample items`);
    
    // Log the created items
    createdItems.forEach(item => {
      console.log(`- ${item.name} (Created by: ${item.created_by})`);
    });
    
    return createdItems;
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
};

// If this script is run directly, execute the seeding
if (require.main === module) {
  seedItems()
    .then(() => {
      console.log('Items seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed items:', error);
      process.exit(1);
    });
}

module.exports = seedItems;