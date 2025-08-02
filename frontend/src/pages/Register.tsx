import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
  console.log("Form Data:", data); // ✅ Log the form data
  try {
    await axios.post("http://localhost:5000/api/auth/register", data);
    alert("Registered successfully");
    navigate("/login");
  } catch (err) {
    console.error("Registration error:", err.response?.data || err.message);
    alert("Registration failed");
  }
};


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #e0f2fe)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "24px", color: "#475569" }}>
          Create your account to get started
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Full Name
          </label>
          <input
            {...register("fullName")}
            placeholder="Enter your full name"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
          <p style={{ color: "red", fontSize: "12px" }}>{errors.fullName?.message}</p>

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Email
          </label>
          <input
            {...register("email")}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
          <p style={{ color: "red", fontSize: "12px" }}>{errors.email?.message}</p>

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
          <p style={{ color: "red", fontSize: "12px" }}>{errors.password?.message}</p>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#16a34a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0f766e", fontWeight: "bold" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
