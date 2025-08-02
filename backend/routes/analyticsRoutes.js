const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSummary,
  getCategorySummary,
  getDailySummary,
} = require("../controllers/analyticsController");

router.get("/summary", protect, getSummary);
router.get("/category-summary", protect, getCategorySummary);
router.get("/daily-summary", protect, getDailySummary);

module.exports = router;
