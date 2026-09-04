import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/accounts/register/", form);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.log(err.response?.data);
      setError(
        JSON.stringify(err.response?.data || "Registration failed")
      );
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p>Join your college lost & found community.</p>

        {error && <div className="error">{error}</div>}

        <div className="two-inputs">
          <input
            name="first_name"
            placeholder="First Name"
            onChange={handleChange}
            required
          />

          <input
            name="last_name"
            placeholder="Last Name"
            onChange={handleChange}
          />
        </div>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button className="primary-btn full-btn">
          Create Account
        </button>

        <p className="auth-bottom">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;