const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Environment Variables ব্যবহারের জন্য

const app = express();
const PORT = process.env.PORT || 5000;

// ১. CORS কনফিগারেশন (Error Fix)
const allowedOrigins = [
  'https://juboshokti-blood-donation-app.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ২. Middlewares
app.use(express.json());

// ৩. Database Connection (MongoDB)
// (আপনার URI থাকলে বসান, অথবা .env ফাইল থেকে নিন)
const mongoURI = process.env.MONGODB_URI || "YOUR_MONGODB_CONNECTION_STRING"; 

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ৪. Root / Health Check Route
app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server is Running!');
});

// ৫. আপনার আসল Routes (Routes ফোল্ডার থাকলে সেগুলোকে Import করে যুক্ত করুন)
// উদাহরণ:
// const donorRoutes = require('./routes/donorRoutes');
// const requestRoutes = require('./routes/requestRoutes');
// app.use('/api/donors', donorRoutes);
// app.use('/api/requests', requestRoutes);

// ৬. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

// ৭. Server Listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});