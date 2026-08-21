const User = require('../models/User');

exports.getDonors = async (req, res) => {
  try {
    const group = req.query.group;
    const filter = group ? { bloodGroup: group } : {};
    const donors = await User.find(filter).select('-password -securityAnswer');
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: 'ডোনার ডাটা লোড করা সম্ভব হয়নি!' });
  }
};