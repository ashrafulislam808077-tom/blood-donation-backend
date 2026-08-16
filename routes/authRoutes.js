const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); // Model Import

// ১. রেজিস্ট্রেশন ও লগইন রুট
router.post('/register', authController.register);
router.post('/login', authController.login);

// ২. পাসওয়ার্ড রিকভারি রুট
router.post('/reset-password/security-question', authController.resetPasswordWithSecurityQuestion);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/reset-password/otp', authController.resetPasswordWithOTP);

// ৩. প্রোফাইল আপডেট রুট (নিরাপদ মিডলওয়্যারসহ)
router.put('/profile/:id', protect, async (req, res) => {
  try {
    const { name, email, location, bloodGroup, isAnonymous, hidePhoneNumber } = req.body;
    
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'অন্যের প্রোফাইল আপডেট করার অনুমতি নেই!' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, email, location, bloodGroup, isAnonymous, hidePhoneNumber } },
      { new: true }
    ).select('-password');

    res.json({ message: 'প্রোফাইল আপডেট সফল হয়েছে!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'প্রোফাইল আপডেট করা সম্ভব হয়নি!' });
  }
});

module.exports = router;