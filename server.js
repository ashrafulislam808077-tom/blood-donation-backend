const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://YOUR_MONGO_URI_HERE')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schema & Models
const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  problem: { type: String },
  bloodGroup: { type: String, required: true },
  hemoglobin: { type: String },
  amount: { type: String, required: true },
  donationDate: { type: String, required: true },
  donationPlace: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

// --- API ROUTES ---

// 1. Get All Blood Requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Requests Error:", err);
    res.status(500).json({ message: 'রিকোয়েস্টগুলো লোড করতে সমস্যা হয়েছে!' });
  }
});

// 2. Post New Blood Request
app.post('/api/requests', async (req, res) => {
  try {
    console.log("Received Request Data:", req.body);
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ message: 'রক্তের আবেদন সফলভাবে জমা হয়েছে!' });
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ message: 'আবেদন জমা দিতে সমস্যা হয়েছে!', error: err.message });
  }
});

// Test Root Route
app.get('/', (req, res) => {
  res.send('Blood Donation API Server is Running...');
});

// 404 Handler for Unmatched Routes
app.use((req, res) => {
  res.status(404).json({ message: 'অনুরোধকৃত রুটটি পাওয়া যায়নি!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));