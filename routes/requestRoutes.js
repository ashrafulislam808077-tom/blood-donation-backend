const express = require('express');
const router = express.Router();
const { createRequest, getRequests, deleteRequest } = require('../controllers/requestController');

router.post('/', createRequest);
router.get('/', getRequests);
router.delete('/:id', deleteRequest);

module.exports = router;