const mongoose = require('mongoose');
require('dotenv').config();
const dataBase = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then((data)=>console.log(`Connected to database : ${data.connection.host}`))
        .catch((err)=>console.log('Error connecting to database', err.message));
}

module.exports = dataBase;