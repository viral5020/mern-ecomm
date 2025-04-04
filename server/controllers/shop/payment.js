// controllers/payment.js

const { Payment } = require('../../models/payment');

// Verify Payment Function
const verify = async (req, res) => {
  const {
    orderId,
    paymentId,
    signature,
    amount,
    orderItems,
    userId,
    userShipping,
  } = req.body;

  try {
    // Simulating payment verification logic
    let orderConfirm = await Payment.create({
      orderId,
      paymentId,
      signature,
      amount,
      orderItems,
      userId,
      userShipping,
      payStatus: 'paid',
    });

    res.json({ message: 'Payment successful', success: true, orderConfirm });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', success: false });
  }
};

// Fetch user orders function
const userOrder = async (req, res) => {
  const userId = req.user._id.toString(); 
  
  try {
    const orders = await Payment.find({ userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching user orders', success: false });
  }
};

// Exporting the functions
module.exports = { verify, userOrder };
