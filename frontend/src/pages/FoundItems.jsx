import { useEffect, useState } from "react";
import api from "../services/api";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      const response = await api.get(
        `/found-items/?search=${search}`
      );

      setItems(response.data.results || response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const claimItem = async (id) => {
    const message = prompt(
      "Tell us why this item belongs to you:"
    );

    if (!message) return;

    try {
      await api.post("/claims/", {
        found_item: id,
        message,
      });

      alert("Claim submitted successfully!");
    } catch (error) {
      alert("Please login before claiming an item.");
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

      <form className="search-box" onSubmit={(e) => {
        e.preventDefault();
        fetchItems();
      }}>
        <input
          placeholder="Search found items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="primary-btn">Search</button>
      </form>

      <div className="item-grid">
        {items.length === 0 ? (
          <div className="empty">
            No found items available.
          </div>
        ) : (
          items.map((item) => (
            <div className="item-card" key={item.id}>
              <div className="item-image">📦</div>

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
          ))
        )}
      </div>
    </div>
  );
}

export default FoundItems;