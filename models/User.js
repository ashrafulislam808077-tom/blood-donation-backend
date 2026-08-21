const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true, unique: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);