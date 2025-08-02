const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");

const { processReceipt, updateTransactionFromReceipt, updateTransactionAmount } = require("../controllers/receiptController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", protect, upload.single("receipt"), processReceipt);
router.put("/update-transaction", protect, updateTransactionFromReceipt);
router.put("/update-amount", protect, updateTransactionAmount);

module.exports = router;
