const mongoose = require('mongoose');

// GiftCard Schema
const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Ensure each code is unique
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // Amount should be at least 1
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields
  }
);

// GiftCard Model
const GiftCard = mongoose.model('GiftCard', giftCardSchema);

module.exports = GiftCard;
