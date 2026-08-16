const User = require('../models/User');

// ডোনার সার্চ করার কন্ট্রোলার
exports.searchDonors = async (req, res) => {
    try {
        const { bloodGroup, location, district, upazila } = req.query;

        // প্রাথমিক ফিল্টার: শুধুমাত্র একটিভ ইউজারদের দেখানো হবে
        let filter = {
            accountStatus: 'Active'
        };

        // ১. রক্তের গ্রুপ ফিল্টার (যদি ইউজার নির্বাচন করে)
        if (bloodGroup) {
            filter.bloodGroup = bloodGroup.trim();
        }

        // ২. লোকেশন সার্চ (Search query বা জেলা/উপজিলা দিয়ে)
        if (location) {
            filter.location = { $regex: location, $options: 'i' }; // কেস-ইনসেনসিটিভ সার্চ
        }

        // ৩. ডোনার তালিকা ডাটাবেজ থেকে খুঁজে বের করা
        // পাসওয়ার্ড এবং সংবেদনশীল ফিল্ড বাদ দিয়ে রেসপন্স পাঠানো
        const donors = await User.find(filter)
            .select('-password -securityQuestion -securityAnswer -resetOTP')
            .sort({ createdAt: -1 });

        // ৪. ডোনারদের প্রাইভেসি হ্যান্ডেল করা (ডাটা প্রসেসিং)
        const formattedDonors = donors.map(donor => {
            const donorData = donor.toObject();

            // ইউজার ফোন নম্বর হাইড করে রাখলে ফোন নম্বর পাঠানো হবে না
            if (donorData.hidePhoneNumber) {
                delete donorData.phone;
            }

            // নাম গোপন রাখতে চাইলে ছদ্মনাম দেখানো
            if (donorData.isAnonymous) {
                donorData.name = "Anonymous Donor";
            }

            return donorData;
        });

        return res.status(200).json({
            success: true,
            count: formattedDonors.length,
            donors: formattedDonors
        });

    } catch (error) {
        console.error("Search Donors Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "ডোনার তালিকা খুঁজতে সমস্যা হয়েছে।" 
        });
    }
};

// একটি নির্দিষ্ট ডোনারের প্রোফাইল দেখার কন্ট্রোলার
exports.getDonorDetails = async (req, res) => {
    try {
        const donor = await User.findById(req.params.id)
            .select('-password -securityQuestion -securityAnswer -resetOTP');

        if (!donor) {
            return res.status(404).json({ message: "ডোনার পাওয়া যায়নি!" });
        }

        // ডোনার ব্যানড থাকলে অ্যালার্ট মেসেজসহ ডাটা পাঠানো
        if (donor.accountStatus === 'Banned') {
            return res.status(200).json({
                isBanned: true,
                warningNotice: "⚠️ সতর্কবার্তা: এই অ্যাকাউন্টটি শর্তাবলী লঙ্ঘনের কারণে স্থায়ীভাবে ব্যান করা হয়েছে!",
                donor: {
                    name: "Banned User",
                    bloodGroup: donor.bloodGroup,
                    accountStatus: donor.accountStatus
                }
            });
        }

        const donorData = donor.toObject();
        if (donorData.hidePhoneNumber) delete donorData.phone;
        if (donorData.isAnonymous) donorData.name = "Anonymous Donor";

        return res.status(200).json({
            isBanned: false,
            donor: donorData
        });

    } catch (error) {
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
    }
};