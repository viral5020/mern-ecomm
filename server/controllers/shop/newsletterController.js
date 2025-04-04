const Newsletter = require('../../models/newsletter');

// Controller function for subscribing a new email
const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ error: 'This email is already subscribed.' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    return res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (err) {
    return res.status(500).json({ error: 'Error subscribing to the newsletter.' });
  }
};

module.exports = { subscribeToNewsletter };
