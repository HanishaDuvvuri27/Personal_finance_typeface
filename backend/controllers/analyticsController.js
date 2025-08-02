const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// Income, expense totals, and balance
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId });

    const income = transactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = transactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = income - expense;

    res.json({ income, expense, balance });
  } catch (err) {
    res.status(500).json({ message: "Summary failed", error: err });
  }
};

// Group expenses by category (pie chart)
exports.getCategorySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const categoryTotals = await Transaction.aggregate([
      { $match: { userId, type: "expense" } },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          name: "$category.name",
          color: "$category.color",
          icon: "$category.icon",
          total: 1,
        },
      },
    ]);

    res.json(categoryTotals);
  } catch (err) {
    res.status(500).json({ message: "Pie chart failed", error: err });
  }
};

// Daily spending summary (bar chart)
exports.getDailySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const daily = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          dailySummary: {
            $push: {
              type: "$_id.type",
              total: "$total",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = daily.map(day => {
      const entry = { date: day._id, income: 0, expense: 0 };
      day.dailySummary.forEach(d => {
        entry[d.type] = d.total;
      });
      return entry;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Bar chart failed", error: err });
  }
};
