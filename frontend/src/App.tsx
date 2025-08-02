import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransactionPage from "./pages/AddTransactionPage";
import Receipts from "./pages/Receipts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {/* Show Navbar only if logged in AND not on login/register pages */}
      {isLoggedIn && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={isLoggedIn ? <Transactions /> : <Navigate to="/login" />} />
        <Route path="/add-transaction" element={isLoggedIn ? <AddTransactionPage /> : <Navigate to="/login" />} />
        <Route path="/receipts" element={isLoggedIn ? <Receipts /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
