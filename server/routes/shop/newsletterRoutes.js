const express = require('express');
const { subscribeToNewsletter } = require('../../controllers/shop/newsletterController');

const router = express.Router();

// POST route to handle newsletter subscription
router.post('/subscribe', subscribeToNewsletter);

module.exports = router;
