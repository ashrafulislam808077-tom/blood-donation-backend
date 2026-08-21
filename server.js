const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// মিডলওয়্যার
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ডাটাবেস কানেকশন
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_URI_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB database connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// এপিআই রাউট
app.use('/api', donorRoutes);
app.use('/api/requests', requestRoutes);

// টেস্ট রুটিং
app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server is Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});