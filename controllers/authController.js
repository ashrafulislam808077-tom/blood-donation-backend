const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, address, password, securityAnswer } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'এই নম্বর দিয়ে ইতিমধ্যেই রেজিস্টার্ড অ্যাকাউন্ট রয়েছে!' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newUser = new User({ name, email, phone, bloodGroup, address, password, securityAnswer, imageUrl });
    await newUser.save();

    res.status(201).json({ message: 'ডোনার রেজিস্ট্রেশন সফল হয়েছে!' });
  } catch (err) {
    res.status(500).json({ message: 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে!' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, password });
    if (!user) {
      return res.status(400).json({ message: 'ফোন নম্বর বা পাসওয়ার্ড ভুল!' });
    }
    res.json({ message: 'লগইন সফল হয়েছে!', user });
  } catch (err) {
    res.status(500).json({ message: 'লগইন করতে সমস্যা হয়েছে!' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phone, securityAnswer, newPassword } = req.body;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি!' });
    }

    if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
      return res.status(400).json({ message: 'সিকিউরিটি প্রশ্নের উত্তর সঠিক নয়!' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
  } catch (err) {
    res.status(500).json({ message: 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!' });
  }
};