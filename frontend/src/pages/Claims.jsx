
import { useEffect, useState } from "react";
import api from "../services/api";

function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [refreshError, setRefreshError] = useState("");

  const fetchClaims = async () => {
    try {
      setRefreshError("");

      const response = await api.get("/claims/");
      const data = response.data.results || response.data;

      setClaims(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch claims:", error);

      setRefreshError(
        error.response?.data?.detail ||
        "Claims load nahi ho sake. Please login karke try karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const reviewClaim = async (claimId, decision) => {
    const confirmed = window.confirm(
      `Kya tum is claim ko ${
        decision === "approved" ? "approve" : "reject"
      } karna chahte ho?`
    );

    if (!confirmed) return;

    setProcessingId(claimId);

    try {
      await api.post(`/claims/${claimId}/review/`, {
        status: decision,
      });

      alert(
        decision === "approved"
          ? "Claim Principal ki taraf se approve ho gaya!"
          : "Claim reject ho gaya!"
      );

      await fetchClaims();
    } catch (error) {
      console.error("Claim review failed:", error);

      const data = error.response?.data;
      const message =
        data?.detail ||
        data?.status?.[0] ||
        data?.found_item?.[0] ||
        "Claim update nahi ho saka. Please dobara try karo.";

      alert(message);
    } finally {
      setProcessingId(null);
    }
  };

  const principalClaims = claims.some(
    (claim) => claim.is_principal === true
  );

  const pendingCount = claims.filter(
    (claim) => claim.status === "pending"
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="small-title">
            {principalClaims
              ? "PRINCIPAL VERIFICATION"
              : "CLAIM MANAGEMENT"}
          </p>

          <h1>
            {principalClaims
              ? "Principal Verification Panel"
              : "Claim Requests"}
          </h1>

          <p>
            {principalClaims
              ? "Students ke claims verify karo aur approve ya reject karo."
              : "Apne claims ka status yahan check karo."}
          </p>
        </div>
      </div>

      {principalClaims && (
        <div className="claim-card">
          <h3>Verification Summary</h3>
          <p>
            <strong>Pending claims:</strong> {pendingCount}
          </p>
          <p>
            Har claim ko check karke hi approve ya reject karein.
          </p>
        </div>
      )}

      {refreshError && (
        <div className="empty">
          <p>{refreshError}</p>
          <button
            type="button"
            className="primary-btn"
            onClick={fetchClaims}
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading claims...</p>
      ) : (
        <div className="claims-list">
          {claims.length === 0 ? (
            <div className="empty">
              Abhi koi claim request nahi hai.
            </div>
          ) : (
            claims.map((claim) => {
              const isPrincipal = claim.is_principal === true;
              const isPending = claim.status === "pending";
              const isProcessing = processingId === claim.id;

              return (
                <div className="claim-card" key={claim.id}>
                  <h3>Found Item #{claim.found_item}</h3>

                  <p>{claim.message}</p>

                  <p>
                    <strong>Claimed by:</strong>{" "}
                    {claim.claimed_by || "User"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`claim-status ${claim.status}`}
                    >
                      {claim.status}
                    </span>
                  </p>

                  {isPrincipal && (
                    <>
                      {claim.reviewed_by && (
                        <p>
                          <strong>Reviewed by:</strong>{" "}
                          {claim.reviewed_by}
                        </p>
                      )}

                      {isPending && (
                        <div className="claim-actions">
                          <button
                            type="button"
                            className="primary-btn"
                            disabled={isProcessing}
                            onClick={() =>
                              reviewClaim(claim.id, "approved")
                            }
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            className="primary-btn"
                            disabled={isProcessing}
                            onClick={() =>
                              reviewClaim(claim.id, "rejected")
                            }
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Claims;
