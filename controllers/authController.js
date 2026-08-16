const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ১. ইমেইল পাঠানোর নোডমেইলার ট্রান্সপোর্টার (ফ্রি জিমেইল সার্ভিস)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // আপনার জিমেইল আইডি (.env ফাইল থেকে)
    pass: process.env.EMAIL_PASS  // গুগলের ১৬ ডিজিটের App Password (.env ফাইল থেকে)
  }
});

// ২. ইউজার রেজিস্ট্রেশন
exports.register = async (req, res) => {
    try {
        const { 
          name, 
          email, 
          phone, 
          password, 
          bloodGroup, 
          location, 
          securityQuestion, 
          securityAnswer,
          isAnonymous, 
          hidePhoneNumber 
        } = req.body;

        if (!name || !phone || !password || !bloodGroup || !location || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: "দয়া করে সকল প্রয়োজনীয় তথ্য ও সিকিউরিটি প্রশ্নের উত্তর দিন!" });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "এই মোবাইল নম্বরটি ইতোমধ্যে রেজিস্টার করা হয়েছে!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);

        const newUser = new User({
            name,
            email: email || "",
            phone,
            password: hashedPassword,
            bloodGroup,
            location,
            securityQuestion,
            securityAnswer: hashedAnswer,
            isAnonymous: isAnonymous || false,
            hidePhoneNumber: hidePhoneNumber || false
        });

        await newUser.save();
        return res.status(201).json({ message: "রেজিস্ট্রেশন সফল হয়েছে!" });

    } catch (error) {
        return res.status(500).json({ message: error.message || "সার্ভারে সমস্যা হয়েছে।" });
    }
};

// ৩. ইউজার লগইন (Ban/Suspended Alert সহ)
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: "মোবাইল নম্বর এবং পাসওয়ার্ড দিন!" });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: "এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি!" });
        }

        if (user.accountStatus === 'Banned' || user.accountStatus === 'Suspended') {
            return res.status(403).json({ 
              status: user.accountStatus,
              message: user.systemNotice || (user.accountStatus === 'Banned' 
                ? "প্রতারণামূলক কার্যক্রম বা অর্থ দাবির অভিযোগ প্রমাণিত হওয়ায় আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্যান করা হয়েছে।"
                : "প্রতারণামূলক কার্যক্রম বা অর্থ দাবির অভিযোগে আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে।"),
              showNotification: true
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "পাসওয়ার্ড ভুল হয়েছে!" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "লগইন সফল হয়েছে!",
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                role: user.role,
                accountStatus: user.accountStatus,
                systemNotice: user.systemNotice
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
    }
};

// ৪. সিকিউরিটি কোশ্চেন দিয়ে পাসওয়ার্ড রিকভারি (১ম ধাপ)
exports.resetPasswordWithSecurityQuestion = async (req, res) => {
    try {
        const { phone, securityAnswer, newPassword } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const isAnswerCorrect = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswer);
        if (!isAnswerCorrect) {
            return res.status(400).json({ message: "সিকিউরিটি প্রশ্নের উত্তর ভুল হয়েছে! ইমেইল OTP চেষ্টা করুন।" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });

    } catch (error) {
        return res.status(500).json({ message: "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে।" });
    }
};

// ৫. ইমেইলে OTP পাঠানো (২য় বিকল্প ধাপ - সিকিউরিটি প্রশ্ন ভুলে গেলে)
exports.sendEmailOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User.findOne({ phone });

        if (!user || !user.email) {
            return res.status(404).json({ message: "নম্বর বা যুক্ত করা ইমেইল পাওয়া যায়নি!" });
        }

        // ৬ ডিজিটের OTP তৈরি
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // ওটিপি সেভ করা (১০ মিনিট মেয়াদি করতে পারেন)
        user.resetOTP = otp;
        await user.save();

        const mailOptions = {
            from: `"Blood Donation App" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড',
            text: `আপনার পাসওয়ার্ড রিসেট করার জন্য ৬ ডিজিটের OTP কোডটি হলো: ${otp}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ 
            message: "আপনার রেজিস্টার্ড ইমেইলে ৬ ডিজিটের OTP পাঠানো হয়েছে। অনুগ্রহ করে ইমেইল চেক করুন।" 
        });

    } catch (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ message: "ইমেইল পাঠাতে সমস্যা হয়েছে।" });
    }
};

// ৬. ইমেইল OTP দিয়ে পাসওয়ার্ড রিসেট করা
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { phone, otp, newPassword } = req.body;

        const user = await User.findOne({ phone });
        if (!user || user.resetOTP !== otp) {
            return res.status(400).json({ message: "ভুল OTP কোড দেওয়া হয়েছে!" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetOTP = null; // OTP মুছে ফেলা
        await user.save();

        return res.status(200).json({ message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });

    } catch (error) {
        return res.status(500).json({ message: "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।" });
    }
};