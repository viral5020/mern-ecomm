const Category = require("../../models/Category");

exports.createCategory = async (req, res) => {
    try {
      const { name, image } = req.body;
      console.log("Received category data:", { name, image }); // Log request data
  
      // Validate and create category logic here
      const newCategory = await Category.create({
        name,
        image,
      });
  
      console.log("Created category:", newCategory); // Log the created category
  
      res.status(201).json({
        success: true,
        category: newCategory,
      });
    } catch (error) {
      console.error("Error creating category:", error); // Log error details
      res.status(500).json({ success: false, message: "Error creating category" });
    }
  };
  


// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single category by id
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a category by id
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a category by id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
