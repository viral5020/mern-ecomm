const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../server/models/User');  // Ensure the User model is imported

const router = express.Router();
const port = 5000;

// Set up Nodemailer transporter with your email service details
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'viralajudia123@gmail.com', // Your email
    pass: 'ohgz tzef heus zhsm', // Your app password
  },
});

// API to add a new product and send email to all users
router.post('/api/add-product-email', async (req, res) => {
  const { title, description, price, image } = req.body;

  // Validate required fields
  if (!title || !description || !price) {
    return res.status(400).send('All product fields (title, description, price) are required.');
  }

  // Create a new product (You can save this product to your database if needed)
  const newProduct = { title, description, price, image };
  console.log('New product added:', newProduct);

  try {
    // Fetch all user emails from the database
    const users = await User.find();  // Ensure you're importing and using the User model correctly
    const userEmails = users.map((user) => user.email);  // Access the correct email property

    // Prepare email content
    const mailOptions = {
      from: 'viralajudia123@gmail.com',  // Sender email
      to: userEmails.join(','),  // Join emails with commas to send to all users
      subject: 'New Product Available!',
      text: `
    Hello,

    We are excited to announce the arrival of our newest product: **${title}**! 🎉

    Here's a sneak peek of the product:

    **Product Name:** ${title}
    **Description:** ${description}
    **Price:** ${price}

    This is a limited-time offer, so don’t miss out on the chance to grab it while it lasts!

    Visit our website to check it out and make your purchase today:
    

    If you have any questions or need assistance, feel free to reach out to our support team.

    Thank you for being a valued customer, and we hope you enjoy our latest addition!

    Best regards,
    
  `,
    };

    // Send the email to all users
    await transporter.sendMail(mailOptions);

    console.log('Email sent to all users');
    return res.status(200).json({ message: 'Email sent successfully.' });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      message: 'Failed to send email.',
      error: error.message,  // Send back detailed error message
    });
  }
});

module.exports = router;
