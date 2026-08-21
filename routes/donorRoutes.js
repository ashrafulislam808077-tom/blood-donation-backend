const express = require('express');
const router = express.Router();
const { getDonors } = require('../controllers/donorController');

router.get('/', getDonors);

module.exports = router;