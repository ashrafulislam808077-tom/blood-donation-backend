const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // আপনার তৈরি করা db.js কানেকশন

// ১. Environment Variables লোড করা
dotenv.config();

const app = express();

// ২. ডাটাবেজ কানেক্ট করা
connectDB();

// ৩. মিডলওয়্যার কনফিগারেশন
app.use(cors());
app.use(express.json());

// ৪. রুটের ইমপোর্টসমূহ (Routes Import)
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');

// ৫. এপিআই রুট ব্যবহার (Routes Usage)
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

// ৬. বেসিক টেস্ট রুট (Health Check)
app.get('/', (req, res) => {
  res.send('Blood Donation App API চালু রয়েছে!');
});

// ৭. ভুল বা অজানা রুটের জন্য হ্যান্ডলার (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({ message: 'অনুরোধকৃত রুটটি পাওয়া যায়নি!' });
});

// ৮. সার্ভার চালুকরণ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`সার্ভারটি পোর্ট ${PORT}-এ সফলভাবে চালু হয়েছে।`);
});