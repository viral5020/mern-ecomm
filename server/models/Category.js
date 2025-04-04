const mongoose = require("mongoose");

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
