const express = require('express');
const router = express.Router();
const User = require('../models/User'); // আপনার User Model Import

// ১. ডোনার রেজিস্ট্রেশন রুট
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'রেজিস্ট্রেশন সফল হয়েছে!' });
  } catch (error) {
    res.status(500).json({ message: 'রেজিস্ট্রেশন করতে ব্যর্থ হয়েছেন!' });
  }
});

// ২. লগইন রুট
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ token: 'login-success-token', user });
    } else {
      res.status(400).json({ message: 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'সার্ভার ত্রুটি!' });
  }
});

// ৩. সকল ডোনারদের তালিকা রুট
router.get('/donors', async (req, res) => {
  try {
    const donors = await User.find();
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'ডোনারদের তালিকা আনা সম্ভব হয়নি!' });
  }
});

// ৪. ইউজার প্রোফাইল আপডেট রুট
router.put('/profile/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: 'প্রোফাইল আপডেট সফল হয়েছে!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'প্রোফাইল আপডেট করা সম্ভব হয়নি!' });
  }
});

module.exports = router;