import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive({ message: "Amount must be positive" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string(),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Category {
  _id: string;
  name: string;
  type: string;
}

export default function AddTransaction({ onAdded }: { onAdded: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(res.data);
      } catch (err) {
        alert("Failed to load categories");
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("http://localhost:5000/api/transactions", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Transaction added successfully");
      reset();
      onAdded();
    } catch (err) {
      console.error(err);
      alert("Failed to add transaction");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 0 15px rgba(0,0,0,0.06)",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Add New Transaction
      </h2>

      {/* Transaction Type */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Transaction Type
        </label>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="radio" value="income" {...register("type")} />
            <span style={{ color: "#10b981", fontWeight: 500 }}>Income</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="radio" value="expense" {...register("type")} />
            <span style={{ color: "#ef4444", fontWeight: 500 }}>Expense</span>
          </label>
        </div>
      </div>

      {/* Amount & Date */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, marginBottom: "4px", display: "block" }}>Amount</label>
          <input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            placeholder="Enter amount"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          {errors.amount && (
            <p style={{ color: "#dc2626", fontSize: "12px" }}>{errors.amount.message}</p>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, marginBottom: "4px", display: "block" }}>Date</label>
          <input
            type="date"
            {...register("date")}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Description</label>
        <input
          type="text"
          {...register("description")}
          placeholder="Enter transaction description"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        {errors.description && (
          <p style={{ color: "#dc2626", fontSize: "12px" }}>{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Category</label>
        <select
          {...register("categoryId")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        >
          <option value="">Select a category</option>
          {categories
            .filter((cat) => cat.type === selectedType)
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>
        {errors.categoryId && (
          <p style={{ color: "#dc2626", fontSize: "12px" }}>{errors.categoryId.message}</p>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>
          Notes (Optional)
        </label>
        <textarea
          {...register("notes")}
          placeholder="Additional notes about this transaction"
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: "#10b981",
          color: "#fff",
          padding: "12px",
          width: "100%",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Add Transaction
      </button>
    </form>
  );
}
