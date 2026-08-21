const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientProblem: String,
  bloodGroup: { type: String, required: true },
  hemoglobin: String,
  amount: { type: String, required: true },
  donationTime: String,
  donationDate: { type: String, required: true },
  donationPlace: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: String
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);