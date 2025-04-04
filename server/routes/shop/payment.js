// routes/payment.js

const express = require('express');
const { verify, userOrder } = require('../../controllers/shop/payment'); // Import controller functions

const router = express.Router();

// Handle POST request to verify payment
router.post('/verify', verify); // Ensure 'verify' function is defined and imported

// Handle GET request to fetch user orders
router.get('/user-orders', userOrder); // Ensure 'userOrder' function is defined and imported

// Export the router to use in server.js
module.exports = router;
