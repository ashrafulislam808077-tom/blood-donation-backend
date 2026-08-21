const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// মিডলওয়্যার
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ডাটাবেস কানেকশন (আপডেট করা পাসওয়ার্ডসহ)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ashrafulislam808077_db_user:858636@cluster0.p4pbe.mongodb.net/blood_donation?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB database connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// এপিআই রাউট
app.use('/api', donorRoutes);
app.use('/api/requests', requestRoutes);

// টেস্ট রাউটিং
app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server is Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});