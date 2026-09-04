import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ReportFound() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    item_name: "",
    category: "other",
    description: "",
    location: "",
    found_date: "",
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
      await api.post("/found-items/", form);

      alert("Found item reported successfully!");
      navigate("/found-items");
    } catch (error) {
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
        <p className="small-title">REPORT FOUND ITEM</p>
        <h1>Help someone find their item</h1>

        <label>Item Name</label>
        <input
          name="item_name"
          placeholder="e.g. Blue Water Bottle"
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
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
          placeholder="Describe the item..."
          onChange={handleChange}
          required
        />

        <label>Found Location</label>
        <input
          name="location"
          placeholder="e.g. College Library"
          onChange={handleChange}
          required
        />

        <label>Found Date</label>
        <input
          type="date"
          name="found_date"
          onChange={handleChange}
          required
        />

        <button className="primary-btn full-btn">
          Submit Found Report
        </button>
      </form>
    </div>
  );
}

export default ReportFound;