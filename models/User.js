const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  location: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['donor', 'recipient', 'admin'], 
    default: 'donor' 
  },
  
  // শেষ রক্ত দেওয়ার তারিখ (Date টাইপ রাখা হলো যেন DD/MM/YYYY ফরম্যাটে হ্যান্ডেল করা যায়)
  lastDonatedDate: { type: Date },
  isAvailable: { type: Boolean, default: true },

  // নিরাপত্তা ও প্রাইভেসি
  isAnonymous: { type: Boolean, default: false },
  hidePhoneNumber: { type: Boolean, default: false },

  // রিপোর্ট ও ব্যান ম্যানেজমেন্ট
  reportCount: { type: Number, default: 0 },
  accountStatus: { 
    type: String, 
    enum: ['Active', 'Warned', 'Suspended', 'Banned'], 
    default: 'Active' 
  },
  banReason: { type: String, default: '' },
  systemNotice: { type: String, default: '' },

  // ব্লকড ইউজার লিস্ট
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);