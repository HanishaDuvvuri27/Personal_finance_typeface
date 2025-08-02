import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SummaryData {
  income: number;
  expense: number;
  balance: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface CategorySummary {
  name: string;
  color: string;
  icon: string;
  total: number;
}

interface DailySummary {
  date: string;
  income: number;
  expense: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, txRes, catRes, dailyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/analytics/summary", { headers }),
        axios.get("http://localhost:5000/api/transactions", { headers }),
        axios.get("http://localhost:5000/api/analytics/category-summary", { headers }),
        axios.get("http://localhost:5000/api/analytics/daily-summary", { headers }),
      ]);

      setSummary(summaryRes.data);
      setTransactions(txRes.data.transactions);
      setCategorySummary(catRes.data);
      setDailySummary(dailyRes.data);
    } catch (err) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate, token]);

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Dashboard</h2>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <div style={{ flex: 1, backgroundColor: "#10b981", color: "white", padding: "20px", borderRadius: "8px" }}>
            <h4>Total Income</h4>
            <h2>₹{summary.income.toFixed(2)}</h2>
          </div>
          <div style={{ flex: 1, backgroundColor: "#ef4444", color: "white", padding: "20px", borderRadius: "8px" }}>
            <h4>Total Expenses</h4>
            <h2>₹{summary.expense.toFixed(2)}</h2>
          </div>
          <div style={{ flex: 1, backgroundColor: "#059669", color: "white", padding: "20px", borderRadius: "8px" }}>
            <h4>Net Balance</h4>
            <h2>₹{summary.balance.toFixed(2)}</h2>
          </div>
          <div style={{ flex: 1, backgroundColor: "#3b82f6", color: "white", padding: "20px", borderRadius: "8px" }}>
            <h4>Transactions</h4>
            <h2>{transactions.length}</h2>
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ flex: 1, backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px" }}>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySummary}
                dataKey="total"
                nameKey="name"
                outerRadius={100}
                label={(entry) => entry.name}
              >
                {categorySummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px" }}>Daily Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySummary}>
              <XAxis dataKey="date" />
              <YAxis />
              <Legend />
              <RechartsTooltip />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "15px" }}>Recent Transactions</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {transactions.map((tx) => (
            <li key={tx._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>
                <strong>{tx.description}</strong> <br />
                <small>{tx.date.slice(0, 10)} • {tx.type}</small>
              </span>
              <span style={{ color: tx.type === "income" ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                {tx.type === "income" ? "+" : "-"}₹{tx.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
