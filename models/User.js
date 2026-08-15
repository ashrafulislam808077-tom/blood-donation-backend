const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  profilePic: { type: String, default: '' },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 