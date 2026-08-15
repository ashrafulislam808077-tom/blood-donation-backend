const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        console.log("Received Data from Frontend:", req.body);

        const { name, email, phone, password, bloodGroup, location, securityQuestion, securityAnswer } = req.body;

        // ১. প্রয়োজনীয় সব ফিল্ড এসেছে কিনা চেক করা
        if (!name || !phone || !password || !bloodGroup || !location || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: "দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন!" });
        }

        // ২. মোবাইল নম্বর ইতোমধ্যে আছে কিনা চেক করা
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "এই মোবাইল নম্বরটি ইতোমধ্যে রেজিস্টার করা হয়েছে!" });
        }

        // ৩. নতুন ইউজার তৈরি ও ডাটাবেজে সেভ করা
        const newUser = new User({
            name,
            email: email || "",
            phone,
            password,
            bloodGroup,
            location,
            securityQuestion,
            securityAnswer
        });

        await newUser.save();

        console.log("User successfully saved to MongoDB!");
        return res.status(201).json({ message: "রেজিস্ট্রেশন সফল হয়েছে!", user: newUser });

    } catch (error) {
        console.error("Backend Error:", error);
        return res.status(500).json({ message: error.message || "সার্ভারে সমস্যা হয়েছে।" });
    }
};