import { useEffect, useState } from "react";
import api from "../services/api";

function Claims() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get("/claims/");
        setClaims(response.data.results || response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="small-title">MY CLAIMS</p>
          <h1>Claim Requests</h1>
        </div>
      </div>

      <div className="claims-list">
        {claims.length === 0 ? (
          <div className="empty">
            You haven't submitted any claims yet.
          </div>
        ) : (
          claims.map((claim) => (
            <div className="claim-card" key={claim.id}>
              <h3>Found Item #{claim.found_item}</h3>

              <p>{claim.message}</p>

              <span className={`claim-status ${claim.status}`}>
                {claim.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Claims;