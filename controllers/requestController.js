const Request = require('../models/Request');

// ১. নতুন রক্তের আবেদন তৈরি করা
exports.createRequest = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || req.query.lang || 'en';

    const {
      problem,
      bloodGroup,
      hemoglobin,
      unitsNeeded,
      donationTime,
      donationDate,
      location,
      phone,
      contactPhone,
      reference,
      urgency
    } = req.body;

    const targetPhone = phone || contactPhone;

    // তথ্য ভ্যালিডেশন
    if (!problem || !bloodGroup || !hemoglobin || !unitsNeeded || !donationDate || !location || !targetPhone) {
      return res.status(400).json({
        success: false,
        message: lang.startsWith('bn')
          ? 'অনুগ্রহ করে সকল আবশ্যক তথ্য সঠিকভাবে পূরণ করুন।'
          : 'Please fill in all required fields.'
      });
    }

    // ডাটাবেজে নতুন রিকোয়েস্ট সেভ
    const newRequest = await Request.create({
      requester: req.user ? req.user._id : null,
      problem,
      bloodGroup,
      hemoglobin,
      unitsNeeded,
      donationTime: donationTime || '',
      donationDate,
      location,
      contactPhone: targetPhone,
      reference: reference || '',
      urgency: urgency || 'Normal'
    });

    // আপনার কাঙ্ক্ষিত রেসপন্স ফরম্যাট
    return res.status(201).json({
      success: true,
      message: lang.startsWith('bn') ? 'রক্তের আবেদন সফলভাবে তৈরি হয়েছে' : 'Blood request created successfully',
      request: {
        id: newRequest._id,
        problem: newRequest.problem,
        bloodGroup: newRequest.bloodGroup,
        hemoglobin: newRequest.hemoglobin,
        unitsNeeded: newRequest.unitsNeeded,
        donationTime: newRequest.donationTime,
        donationDate: newRequest.donationDate,
        location: newRequest.location,
        phone: newRequest.contactPhone,
        reference: newRequest.reference
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. সকল রক্তের আবেদন দেখা
exports.getRequests = async (req, res) => {
  try {
    const { bloodGroup, location, urgency } = req.query;
    let filter = { status: 'Pending' };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const requests = await Request.find(filter)
      .populate('requester', 'name phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ৩. ডোনারের সাড়া (Response) পাঠানো
exports.respondToRequest = async (req, res) => {
  try {
    const { message, sharePhoneWithRequester } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "রিকোয়েস্টটি পাওয়া যায়নি!" });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: "এই রিকোয়েস্টটি আর গ্রহণ করা সম্ভব নয়।" });
    }

    if (req.user && request.requester && request.requester.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "আপনি নিজের রিকোয়েস্টে নিজেই রেসপন্স করতে পারবেন না!" });
    }

    request.responses.push({
      donor: req.user._id,
      donorPhone: req.user.phone,
      sharePhoneWithRequester: sharePhoneWithRequester !== undefined ? sharePhoneWithRequester : true,
      message: message || ''
    });

    await request.save();
    return res.status(200).json({ success: true, message: "আপনার সাড়া সফলভাবে পাঠানো হয়েছে!", request });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};