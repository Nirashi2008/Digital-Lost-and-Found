import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ReportLost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    item_name: "",
    category: "other",
    description: "",
    location: "",
    lost_date: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/lost-items/", form);

      alert("Lost item reported successfully!");
      navigate("/lost-items");
    } catch (error) {
      console.log(error.response?.data);

      if (error.response?.status === 401) {
        alert("Please login first.");
        navigate("/login");
      } else {
        alert("Something went wrong.");
      }
    }
  };

  return (
    <div className="form-page">
      <form className="report-form" onSubmit={submit}>
        <p className="small-title">REPORT LOST ITEM</p>
        <h1>Tell us what you lost</h1>

        <label>Item Name</label>
        <input
          name="item_name"
          placeholder="e.g. Black Wallet"
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select
          name="category"
          onChange={handleChange}
          value={form.category}
        >
          <option value="electronics">Electronics</option>
          <option value="documents">Documents</option>
          <option value="wallet">Wallet</option>
          <option value="keys">Keys</option>
          <option value="books">Books</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe your item..."
          onChange={handleChange}
          required
        />

        <label>Lost Location</label>
        <input
          name="location"
          placeholder="e.g. College Canteen"
          onChange={handleChange}
          required
        />

        <label>Lost Date</label>
        <input
          type="date"
          name="lost_date"
          onChange={handleChange}
          required
        />

        <button className="primary-btn full-btn">
          Submit Lost Report
        </button>
      </form>
    </div>
  );
}

export default ReportLost;