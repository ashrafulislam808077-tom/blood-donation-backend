const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// নতুন আবেদন তৈরি
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ message: 'আবেদন সফলভাবে জমা হয়েছে!' });
  } catch (error) {
    console.error("Request Submit Error:", error);
    res.status(500).json({ message: 'আবেদন পাঠাতে সমস্যা হয়েছে' });
  }
});

// সকল আবেদন পাওয়া
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'ডেটা পেতে সমস্যা হয়েছে' });
  }
});

module.exports = router;