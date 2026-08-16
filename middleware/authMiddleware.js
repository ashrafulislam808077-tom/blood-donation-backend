const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ১. ইউজারের টোকেন ও অ্যাকাউন্ট স্ট্যাটাস যাচাই করার মিডলওয়্যার
const protect = async (req, res, next) => {
  let token;

  // হেডার থেকে Bearer টোকেন চেক করা
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // টোকেন ডিফাইনড কিনা তা ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      
      // আইডি অনুযায়ী ডাটাবেজ থেকে ইউজার বের করা (পাসওয়ার্ড বাদ দিয়ে)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি!' });
      }

      // ইউজার ব্যানড বা সাসপেন্ড থাকলে অ্যাক্সেস ব্লক করা
      if (user.accountStatus === 'Banned' || user.accountStatus === 'Suspended') {
        return res.status(403).json({ 
          message: user.systemNotice || 'আপনার অ্যাকাউন্টটি স্থগিত বা স্থায়ীভাবে ব্যান করা হয়েছে।' 
        });
      }

      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({ message: 'অনুমোদন ব্যর্থ হয়েছে, টোকেন সঠিক নয়!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'কোনো টোকেন পাওয়া যায়নি, অ্যাক্সেস অস্বীকৃত!' });
  }
};

// ২. কেবল অ্যাডমিন এক্সেস চেক করার জন্য মিডলওয়্যার
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'শুধুমাত্র অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন!' });
  }
};

module.exports = { protect, admin };