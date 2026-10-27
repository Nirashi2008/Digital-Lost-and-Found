
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

    if (preview) URL.revokeObjectURL(preview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);

    setImage(null);
    setPreview("");

    const input = document.getElementById("found-item-image");
    if (input) input.value = "";
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
      await api.post("/found-items/", data);

      alert("Found item reported successfully!");
      navigate("/found-items");
    } catch (error) {
      console.error("Found item report error:", error.response?.data || error);

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
        <p className="small-title">REPORT FOUND ITEM</p>
        <h1>Help someone find their item</h1>

        <label>Item Name</label>
        <input
          name="item_name"
          value={form.item_name}
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
          value={form.description}
          placeholder="Describe the item..."
          onChange={handleChange}
          required
        />

        <label>Found Location</label>
        <input
          name="location"
          value={form.location}
          placeholder="e.g. College Library"
          onChange={handleChange}
          required
        />

        <label>Found Date</label>
        <input
          type="date"
          name="found_date"
          value={form.found_date}
          onChange={handleChange}
          required
        />

        <label>Upload Item Image (Optional)</label>
        <input
          id="found-item-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Found item preview" />

            <button
              type="button"
              className="remove-image-btn"
              onClick={removeImage}
            >
              Remove Image
            </button>
          </div>
        )}

        <button
          type="submit"
          className="primary-btn full-btn"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Found Report"}
        </button>
      </form>
    </div>
  );
}

export default ReportFound;
