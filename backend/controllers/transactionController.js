const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");

// CREATE a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, description, categoryId, date, notes, receiptUrl } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      description,
      categoryId,
      date,
      notes,
      receiptUrl,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to create transaction", error: err });
  }
};

// GET transactions with filters
exports.getTransactions = async (req, res) => {
  try {
    const { start, end, page = 1, limit = 100 } = req.query; // Increased default limit

    const query = { userId: req.user._id };

    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate("categoryId")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    console.log(`📊 Found ${transactions.length} transactions for user ${req.user._id}`);
    console.log(` Total transactions in database: ${total}`);

    res.json({ total, page: Number(page), transactions });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({ message: "Failed to fetch transactions", error: err });
  }
};

// DELETE transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err });
  }
};

// UPDATE transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { amount, description, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update transaction", error: err });
  }
};

exports.exportTransactionsCSV = async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { userId: req.user._id };

    if (start && end) {
      query.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const transactions = await Transaction.find(query).populate("categoryId");

    const csvFields = [
      { label: "Date", value: (row) => `"${row.date.toISOString().slice(0, 10)}"` },
      { label: "Type", value: "type" },
      { label: "Amount", value: "amount" },
      { label: "Category", value: (row) => row.categoryId?.name || "" },
      { label: "Description", value: "description" },
      { label: "Notes", value: "notes" },
    ];

    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(transactions);

    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "CSV export failed", error: err });
  }
};