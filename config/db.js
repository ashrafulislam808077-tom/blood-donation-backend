const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // ৫ সেকেন্ডে কানেক্ট না হলে এরর মেসেজ প্রিন্ট করবে
    });
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;