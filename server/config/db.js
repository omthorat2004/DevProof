const mongoose = require('mongoose')
require('dotenv').config()
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Mongodb Connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
  }
}

module.exports = connectDB
