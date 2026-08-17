const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Uploads ফোল্ডারকে পাবলিক করার জন্য static middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration (ছবি আপলোডের জন্য)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://YOUR_MONGO_URI_HERE')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Schemas & Models ---

// 1. User/Donor Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true, unique: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Request Schema (reqNo সহ)
const requestSchema = new mongoose.Schema({
  reqNo: { type: Number },
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

// 1. Registration Route
app.post('/api/register', upload.single('image'), async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, address, password } = req.body;

    const existingUser = await User.findOne({ phone: phone?.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'এই ফোন নম্বর দিয়ে ইতিপূর্বে রেজিস্ট্রেশন করা হয়েছে!' });
    }

    const newUser = new User({
      name,
      email,
      phone: phone?.trim(),
      bloodGroup,
      address,
      password: password?.trim(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await newUser.save();
    res.status(201).json({ message: 'রেজিস্ট্রেশন সফল হয়েছে!' });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে!', error: err.message });
  }
});

// 2. Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = phone ? phone.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    const user = await User.findOne({ phone: cleanPhone, password: cleanPassword });

    if (!user) {
      return res.status(400).json({ message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল!' });
    }

    res.status(200).json({ message: 'লগইন সফল হয়েছে!', user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'লগইন করতে সমস্যা হয়েছে!' });
  }
});

// 3. Get Donors Route
app.get('/api/donors', async (req, res) => {
  try {
    const { group } = req.query;
    const filter = group ? { bloodGroup: group } : {};
    const donors = await User.find(filter).select('-password');
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ message: 'ডোনারদের তালিকা পেতে সমস্যা হয়েছে!' });
  }
});

// 4. Get All Blood Requests Route
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'রিকোয়েস্টগুলো লোড করতে সমস্যা হয়েছে!' });
  }
});

// 5. Post New Blood Request Route (reqNo সহ)
app.post('/api/requests', async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const nextReqNo = totalRequests + 1;

    const newRequest = new Request({
      ...req.body,
      reqNo: nextReqNo
    });

    await newRequest.save();
    res.status(201).json({ message: 'রক্তের আবেদন সফলভাবে জমা হয়েছে!', reqNo: nextReqNo });
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ message: 'আবেদন জমা দিতে সমস্যা হয়েছে!', error: err.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Blood Donation API Server is Running...');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'অনুরোধকৃত রুটটি পাওয়া যায়নি!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));