import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      login(res.data.token); // Use AuthContext login function
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #f8fafc, #ecfdf5)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#4b5563" }}>
          Welcome back! Please sign in
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input
              placeholder="Enter your email"
              {...register("email")}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                marginTop: "0.3rem",
              }}
            />
            <p style={{ color: "red", fontSize: "12px" }}>{errors.email?.message}</p>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                marginTop: "0.3rem",
              }}
            />
            <p style={{ color: "red", fontSize: "12px" }}>{errors.password?.message}</p>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              padding: "0.7rem",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px" }}>
          Don&apos;t have an account?{" "}
          <span style={{ fontWeight: "bold", color: "#111827", cursor: "pointer" }} onClick={() => navigate("/register")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
