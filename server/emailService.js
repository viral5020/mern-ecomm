const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { authMiddleware } = require('./controllers/auth/auth-controller');

const router = express.Router();
const port = 5000;

// Middleware to parse form data (application/x-www-form-urlencoded)
//app.use(bodyParser.urlencoded({ extended: true }));

// Set up Nodemailer transporter with your email service details
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider
  auth: {
    user: 'viralajudia123@gmail.com', // Your email
    pass: 'ohgz tzef heus zhsm', // Your app password
  },
});
//router.use (authMiddleware)

// API to handle order confirmation email
router.post('/api/send-order-confirmation', (req, res) => {
  
  console.log(req.body);
  
  //const { userEmail, item, quantity, total } = req.body;

  // if (!userEmail || !item || !quantity || !total) {
  //   return res.status(400).send('Missing required fields.');
  // }

  const mailOptions = {
    from: 'viralajudia123@gmail.com', // Your email address
    to: req.body.email, // User's email address
    subject: 'Order Confirmation',
    text: `
      Dear ${req.body.name},
  
      Thank you for your order! We’re excited to let you know that we’ve successfully received it and are currently processing your request. You will receive an email with tracking information once your order has shipped.
  
      Order Details:
      - Order Number: ${req.body.orderNumber}
      - Order Date: ${new Date().toLocaleDateString()}
      - Shipping Address: ${req.body.shippingAddress}
  
      If you have any questions or need assistance, please don’t hesitate to contact our support team at support@yourcompany.com.
  
      Thank you for shopping with us!
  
      Best regards,
      Your Company Name
      Your Company Contact Information
    `
  };
  

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Failed to send email.');
    }
    console.log('Email sent: ' + info.response);
    return res.status(200).send('Order confirmation email sent.');
  });
});


module.exports = router;
