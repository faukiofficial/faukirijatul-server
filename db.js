const mongoose = require('mongoose')

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log('Connected to Mongo DB')
    } catch (error) {
        console.log('Connect to MongoDB failed:', error.message)
    }
}

module.exports = connection;