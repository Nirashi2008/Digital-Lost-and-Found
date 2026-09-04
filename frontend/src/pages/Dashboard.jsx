import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <p className="small-title">MY DASHBOARD</p>
        <h1>Lost & Found Dashboard</h1>
        <p>Manage your reports and claims from one place.</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/report-lost" className="dashboard-card">
          <span>🔎</span>
          <h3>Report Lost Item</h3>
          <p>Report something you have lost.</p>
        </Link>

        <Link to="/report-found" className="dashboard-card">
          <span>📦</span>
          <h3>Report Found Item</h3>
          <p>Help someone find their item.</p>
        </Link>

        <Link to="/lost-items" className="dashboard-card">
          <span>📋</span>
          <h3>Lost Items</h3>
          <p>Browse reported lost items.</p>
        </Link>

        <Link to="/found-items" className="dashboard-card">
          <span>🎒</span>
          <h3>Found Items</h3>
          <p>Browse available found items.</p>
        </Link>

        <Link to="/claims" className="dashboard-card">
          <span>🤝</span>
          <h3>My Claims</h3>
          <p>Track your claim requests.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;