const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Routes Configuration
app.use('/api', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server Running!');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ashrafulislam808077_db_user:858696@cluster0.p4pbe.mongodb.net/blood_donation?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB Connection Error:', err));