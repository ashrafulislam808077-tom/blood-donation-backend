const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  hemoglobin: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  donationTime: { type: String, required: true },
  donationDate: { type: String, required: true },
  location: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);