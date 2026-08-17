const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

// ১. CORS কনফিগারেশন
app.use(cors({
  origin: '*', // সব অরিজিন বা Netlify এলাউ করবে
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// স্ট্যাটিক ইমেজ এক্সেস
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ২. Multer ইমেজ আপলোড সেটিংস
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ৩. Mongoose Schema
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true, unique: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  imageUrl: String
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  problem: String,
  bloodGroup: { type: String, required: true },
  hemoglobin: String,
  units: String,
  amount: String,
  donationDate: { type: String, required: true },
  donationPlace: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: String
}, { timestamps: true });

const Donor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

// ৪. Endpoints

// রক্তদানের আবেদন
app.post('/api/requests', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ message: 'রক্তের আবেদন সফলভাবে জমা হয়েছে!' });
  } catch (err) {
    console.error('Request Error:', err);
    res.status(500).json({ error: 'আবেদন জমা নিতে সমস্যা হয়েছে!', message: err.message });
  }
});

// সকল আবেদন
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'রিকোয়েস্ট ডাটা আনতে সমস্যা হয়েছে!' });
  }
});

// ডোনার রেজিস্ট্রেশন
app.post('/api/register', upload.single('image'), async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, address, password } = req.body;
    
    const existingDonor = await Donor.findOne({ phone });
    if (existingDonor) {
      return res.status(400).json({ message: 'এই নম্বরটি দিয়ে ইতিমধ্যেই অ্যাকাউন্ট খোলা রয়েছে!' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newDonor = new Donor({
      name,
      email,
      phone,
      bloodGroup,
      address,
      password,
      imageUrl
    });

    await newDonor.save();
    res.status(201).json({ message: 'রেজিস্ট্রেশন সফল হয়েছে!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি!' });
  }
});

// ডোনার তালিকা
app.get('/api/donors', async (req, res) => {
  try {
    const group = req.query.group;
    const donors = await Donor.find(group ? { bloodGroup: group } : {}).select('-password');
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: 'ডোনার ডাটা আনতে সমস্যা হয়েছে!' });
  }
});

// ডোনার লগইন
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const donor = await Donor.findOne({ phone, password });
    if (!donor) {
      return res.status(400).json({ message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল!' });
    }
    res.json({ message: 'লগইন সফল হয়েছে!', user: donor });
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার সমস্যা!' });
  }
});

// Database Connection & Listen
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'আপনার_MONGODB_URI_এখানে_দিন';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB Connection Error:', err));