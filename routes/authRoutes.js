const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { register, login, resetPassword } = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.post('/reset-password', resetPassword);

module.exports = router;