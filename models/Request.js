const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientName: { type: String, default: '' },
  patientProblem: { type: String, default: '' },
  bloodGroup: { type: String, required: true },
  hemoglobin: { type: String, default: '' },
  amount: { type: String, default: '1' },
  donationTime: { type: String, required: true },
  donationDate: { type: String, default: '' },
  donationPlace: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);