const express = require('express');
const { createGiftCard, getAllGiftCards } = require('../../controllers/admin/giftcard-controller');

const router = express.Router();

// Route to create a new gift card
router.post('/create', createGiftCard);

// Route to fetch all gift cards
router.get('/', getAllGiftCards);

module.exports = router;
