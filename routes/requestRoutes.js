const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// ১. নতুন আবেদন তৈরি (Authentication সহ)
// URL: POST /api/requests/create
router.post('/create', protect, requestController.createRequest);

// ২. সকল পেন্ডিং আবেদন দেখা (ফিল্টার ও সার্চ সুবিধা সহ)
// URL: GET /api/requests
router.get('/', requestController.getRequests);

// ৩. রক্তের আবেদনের বিপরীতে ডোনারের সাড়া পাঠানো
// URL: POST /api/requests/respond/:id
router.post('/respond/:id', protect, requestController.respondToRequest);

module.exports = router;