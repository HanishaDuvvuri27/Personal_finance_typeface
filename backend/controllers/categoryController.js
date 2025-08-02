const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;
    const category = new Category({
      userId: req.user._id,
      name,
      type,
      color,
      icon,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category", error: err });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err });
  }
};
