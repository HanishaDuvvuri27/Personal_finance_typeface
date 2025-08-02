import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
const username = localStorage.getItem("username") || "User";
  const linkStyle = (path: string) => ({
    padding: "8px 16px",
    borderRadius: "6px",
    backgroundColor: location.pathname === path ? "#10b981" : "transparent",
    color: location.pathname === path ? "white" : "#111827",
    fontWeight: location.pathname === path ? "bold" : "500",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        <Link to="/dashboard" style={linkStyle("/dashboard")}>📊 Dashboard</Link>
        <Link to="/transactions" style={linkStyle("/transactions")}>📈 Transactions</Link>
        <Link to="/add-transaction" style={linkStyle("/add-transaction")}>➕ Add Transaction</Link>
        <Link to="/receipts" style={linkStyle("/receipts")}>🧾 Receipts</Link>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#6b7280", fontSize: "14px" }}>
          Welcome, <strong style={{ color: "#6b7280" }}>{username}</strong>
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
             display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "14px",
            padding: "6px 12px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          🔓 Sign Out
        </button>
      </div>
    </nav>
  );
}
