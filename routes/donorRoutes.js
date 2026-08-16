const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// ১. ডোনার ফিল্টার করার জন্য রুট (GET /api/donors/search?bloodGroup=B+&location=Mymensingh)
router.get('/search', donorController.searchDonors);

// ২. নির্দিষ্ট ডোনারের ডিটেইলস দেখার রুট (GET /api/donors/:id)
router.get('/:id', donorController.getDonorDetails);

module.exports = router;