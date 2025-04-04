const GiftCard = require('../../models/Giftcard');

// Create a new Gift Card
const createGiftCard = async (req, res) => {
  const { code, amount } = req.body;

  try {
    // Check if the gift card code already exists
    const existingGiftCard = await GiftCard.findOne({ code });
    if (existingGiftCard) {
      return res.status(400).json({ message: 'Gift card code already exists.' });
    }

    // Create a new gift card
    const newGiftCard = new GiftCard({ code, amount });
    await newGiftCard.save();

    res.status(201).json({
      message: 'Gift card created successfully!',
      giftCard: newGiftCard,
    });
  } catch (error) {
    console.error('Error creating gift card:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

// Get all Gift Cards
const getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find();
    res.status(200).json(giftCards);
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    res.status(500).json({ message: 'Error fetching gift cards.' });
  }
};

module.exports = {
  createGiftCard,
  getAllGiftCards,
};
