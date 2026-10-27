
import { useEffect, useState } from "react";
import api from "../services/api";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = async (searchText = search) => {
    setLoading(true);

    try {
      const response = await api.get("/found-items/", {
        params: { search: searchText },
      });

      setItems(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch found items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems("");
  }, []);

  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const baseURL = api.defaults.baseURL || "";
    const origin = baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");

    return `${origin}/${image.replace(/^\//, "")}`;
  };

  const claimItem = async (id) => {
    const message = prompt(
      "Tell us why this item belongs to you:"
    );

    if (!message?.trim()) return;

    try {
      await api.post("/claims/", {
        found_item: id,
        message: message.trim(),
      });

      alert("Claim submitted successfully!");
    } catch (error) {
      console.error("Claim failed:", error);
      alert(
        error.response?.data?.detail ||
        "Please login before claiming an item."
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="small-title">FOUND ITEMS</p>
          <h1>Items Found on Campus</h1>
        </div>
      </div>

      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          fetchItems(search);
        }}
      >
        <input
          placeholder="Search found items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit" className="primary-btn">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading found items...</p>
      ) : (
        <div className="item-grid">
          {items.length === 0 ? (
            <div className="empty">
              No found items available.
            </div>
          ) : (
            items.map((item) => {
              const imageUrl = getImageUrl(item.image);

              return (
                <div className="item-card" key={item.id}>
                  <div className="item-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.item_name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="image-placeholder">📦</span>
                    )}
                  </div>

                  <div className="item-content">
                    <span className="status found-status">
                      {item.status}
                    </span>

                    <h3>{item.item_name}</h3>
                    <p>{item.description}</p>

                    <div className="item-info">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.found_date}</span>
                    </div>

                    <button
                      type="button"
                      className="primary-btn claim-btn"
                      onClick={() => claimItem(item.id)}
                      disabled={item.status !== "available"}
                    >
                      {item.status === "available"
                        ? "Claim Item"
                        : "Already Claimed"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default FoundItems;
