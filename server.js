const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ডাটাবেস সংযোগ
connectDB();

// মিডলওয়্যার (Base64 ছবি সাপোর্ট করার জন্য ৫০MB লিমিট)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// এপিআই রুটস
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

app.get('/', (req, res) => {
  res.send('Blood Donation API Working!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});