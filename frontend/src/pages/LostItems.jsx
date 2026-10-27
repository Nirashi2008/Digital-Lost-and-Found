
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function LostItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = async (searchText = search) => {
    setLoading(true);

    try {
      const response = await api.get("/lost-items/", {
        params: { search: searchText },
      });

      setItems(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch lost items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems("");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(search);
  };

  const getImageUrl = (image) => {
    if (!image) return null;

    // Absolute URL, such as a cloud-storage URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Relative URL returned by the Django API
    const baseURL = api.defaults.baseURL || "";
    const origin = baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");

    return `${origin}/${image.replace(/^\//, "")}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="small-title">LOST ITEMS</p>
          <h1>Recently Reported Lost Items</h1>
        </div>

        <Link to="/report-lost" className="primary-btn">
          + Report Lost
        </Link>
      </div>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          placeholder="Search item name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit" className="primary-btn">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading lost items...</p>
      ) : (
        <div className="item-grid">
          {items.length === 0 ? (
            <div className="empty">No lost items found.</div>
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
                      <span className="image-placeholder">🔎</span>
                    )}
                  </div>

                  <div className="item-content">
                    <span className="status lost-status">
                      {item.status}
                    </span>

                    <h3>{item.item_name}</h3>
                    <p>{item.description}</p>

                    <div className="item-info">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.lost_date}</span>
                    </div>

                    <small>
                      Reported by: {item.reported_by}
                    </small>
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

export default LostItems;
