import { useEffect, useState } from "react";
import axios from "axios";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: {
    _id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ amount: 0, description: "" });
  const token = localStorage.getItem("token");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      console.log("🔄 Fetching transactions...");
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("📊 Transactions response:", res.data);
      console.log(`📊 Found ${res.data.transactions?.length || 0} transactions`);
      
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilter = () => {
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      alert("Failed to delete transaction");
    }
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx._id);
    setFormData({ amount: tx.amount, description: tx.description });
  };

  const downloadCSV = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);

    const res = await fetch(`http://localhost:5000/api/transactions/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await axios.put(
        `http://localhost:5000/api/transactions/${editingId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Transaction updated");
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      alert("Failed to update");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>Transactions</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={handleFilter} style={{ padding: "6px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6 }}>Apply Filter</button>
        <button onClick={downloadCSV} style={{ padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6 }}>⬇️ Download CSV</button>
        <button onClick={fetchTransactions} style={{ padding: "6px 12px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6 }}>🔄 Refresh</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          <p>No transactions found.</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Try uploading a receipt or adding a transaction manually.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
            Showing {transactions.length} transaction(s)
          </p>
          {transactions.map((tx) => (
            <div
              key={tx._id}
              style={{
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb"
              }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div>{tx.categoryId?.icon || "💰"}</div>
                <div>
                  <strong>{tx.description}</strong>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    {tx.categoryId?.name || "N/A"} • {new Date(tx.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ color: tx.type === "expense" ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                  {tx.type === "expense" ? `-₹${tx.amount}` : `+₹${tx.amount}`}
                </div>
                {editingId === tx._id ? (
                  <>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: parseFloat(e.target.value) })
                      }
                      style={{ width: "80px" }}
                    />
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      style={{ width: "120px" }}
                    />
                    <button onClick={handleUpdate}>💾</button>
                    <button onClick={() => setEditingId(null)}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(tx)}>✏️</button>
                    <button onClick={() => handleDelete(tx._id)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
