const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { exportTransactionsCSV } = require("../controllers/transactionController");



const {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
} = require("../controllers/transactionController");

router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, deleteTransaction);
router.put("/:id", protect, updateTransaction); 
router.get("/export", protect, exportTransactionsCSV); 
module.exports = router;
