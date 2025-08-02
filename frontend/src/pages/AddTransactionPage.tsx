import { useNavigate } from "react-router-dom";
import AddTransaction from "../components/AddTransaction";

export default function AddTransactionPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Add New Transaction</h2>
      <AddTransaction onAdded={() => navigate("/dashboard")} />
    </div>
  );
}
