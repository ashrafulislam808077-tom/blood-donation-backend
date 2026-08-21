const Request = require('../models/Request');

// ১. রক্তের নতুন আবেদন তৈরি
exports.createRequest = async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ message: 'রক্তের আবেদন সফলভাবে জমা হয়েছে!' });
  } catch (err) {
    res.status(500).json({ message: 'আবেদন জমা নিতে সমস্যা হয়েছে!', error: err.message });
  }
};

// ২. সকল রক্তের আবেদন দেখা
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'ডাটা আনতে সমস্যা হয়েছে!' });
  }
};

// ৩. রক্তের আবেদন ডিলিট করা
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await Request.findByIdAndDelete(id);
    res.json({ message: 'রক্তের আবেদনটি সফলভাবে মুছে ফেলা হয়েছে!' });
  } catch (err) {
    res.status(500).json({ message: 'আবেদনটি মোছা সম্ভব হয়নি!' });
  }
};