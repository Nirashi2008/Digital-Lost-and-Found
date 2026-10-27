
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

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (image) {
      data.append("image", image);
    }

    setSubmitting(true);

    try {
      await api.post("/lost-items/", data);

      alert("Lost item reported successfully!");
      navigate("/lost-items");
    } catch (error) {
      console.error("Lost item submission failed:", error.response?.data || error);

      if (error.response?.status === 401) {
        alert("Please login first.");
        navigate("/login");
      } else {
        alert(
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
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
          value={form.item_name}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
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
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Lost Location</label>
        <input
          name="location"
          placeholder="e.g. College Canteen"
          value={form.location}
          onChange={handleChange}
          required
        />

        <label>Lost Date</label>
        <input
          type="date"
          name="lost_date"
          value={form.lost_date}
          onChange={handleChange}
          required
        />

        <label>Item Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="image-preview">
            <img
              src={preview}
              alt="Lost item preview"
              style={{
                width: "100%",
                maxWidth: "320px",
                maxHeight: "240px",
                objectFit: "contain",
                marginTop: "12px",
                borderRadius: "12px",
              }}
            />

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                URL.revokeObjectURL(preview);
                setPreview("");
                setImage(null);
              }}
            >
              Remove Photo
            </button>
          </div>
        )}

        <button
          type="submit"
          className="primary-btn full-btn"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Lost Report"}
        </button>
      </form>
    </div>
  );
}

export default ReportLost;
