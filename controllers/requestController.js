const Request = require('../models/Request');

// ১. নতুন রক্তের আবেদন তৈরি
const createRequest = async (req, res) => {
  try {
    // Client কোন ভাষায় ডাটা চাচ্ছে তা নির্ধারণ করা (Header বা Query থেকে)
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
      reference
    } = req.body;

    // Validation (তথ্য খালি থাকলে ভাষা অনুযায়ী মেসেজ দেওয়া)
    if (
      !problem ||
      !bloodGroup ||
      !hemoglobin ||
      !unitsNeeded ||
      !donationTime ||
      !donationDate ||
      !location ||
      !phone
    ) {
      return res.status(400).json({
        message: lang.startsWith('bn')
          ? 'অনুগ্রহ করে সকল আবশ্যক তথ্য সঠিকভাবে পূরণ করুন।'
          : 'Please fill in all required fields.'
      });
    }

    const newRequest = await Request.create({
      problem,
      bloodGroup,
      hemoglobin,
      unitsNeeded,
      donationTime,
      donationDate,
      location,
      phone,
      reference: reference || (lang.startsWith('bn') ? 'নাই' : 'N/A')
    });

    // ভাষা অনুযায়ী Response Object সাজানো
    const responseData = lang.startsWith('bn')
      ? {
          "রোগীর সমস্যা": newRequest.problem,
          "রক্তের গ্রুপ": newRequest.bloodGroup,
          "হিমোগ্লোবিন": newRequest.hemoglobin,
          "রক্তের পরিমাণ": newRequest.unitsNeeded,
          "রক্তদানের সময়": newRequest.donationTime,
          "রক্তদানের তারিখ": newRequest.donationDate,
          "রক্তদানের স্থান": newRequest.location,
          "যোগাযোগ": newRequest.phone,
          "রেফারেন্স": newRequest.reference,
          "_id": newRequest._id,
          "createdAt": newRequest.createdAt
        }
      : {
          problem: newRequest.problem,
          bloodGroup: newRequest.bloodGroup,
          hemoglobin: newRequest.hemoglobin,
          unitsNeeded: newRequest.unitsNeeded,
          donationTime: newRequest.donationTime,
          donationDate: newRequest.donationDate,
          location: newRequest.location,
          phone: newRequest.phone,
          reference: newRequest.reference,
          _id: newRequest._id,
          createdAt: newRequest.createdAt
        };

    res.status(201).json({
      message: lang.startsWith('bn')
        ? 'রক্তের আবেদন সফলভাবে তৈরি হয়েছে'
        : 'Blood request created successfully',
      data: responseData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. সকল রক্তের আবেদন দেখা
const getRequests = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || req.query.lang || 'en';
    const requests = await Request.find().sort({ createdAt: -1 });

    const formattedRequests = requests.map(reqItem => {
      if (lang.startsWith('bn')) {
        return {
          "রোগীর সমস্যা": reqItem.problem,
          "রক্তের গ্রুপ": reqItem.bloodGroup,
          "হিমোগ্লোবিন": reqItem.hemoglobin,
          "রক্তের পরিমাণ": reqItem.unitsNeeded,
          "রক্তদানের সময়": reqItem.donationTime,
          "রক্তদানের তারিখ": reqItem.donationDate,
          "রক্তদানের স্থান": reqItem.location,
          "যোগাযোগ": reqItem.phone,
          "রেফারেন্স": reqItem.reference,
          "_id": reqItem._id,
          "createdAt": reqItem.createdAt
        };
      }
      return reqItem;
    });

    res.status(200).json(formattedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getRequests };