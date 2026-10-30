
import { Link, useNavigate } from "react-router-dom";
import Notifications from "./Notifications";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const logout = () => {
    // Remove authentication tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Redirect to login without reloading the website
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🔎 Lost<span>&amp;</span>Found
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/lost-items">Lost Items</Link>
        <Link to="/found-items">Found Items</Link>

        {token ? (
          <>
            <Link to="/report-lost">Report Lost</Link>
            <Link to="/report-found">Report Found</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/claims">My Claims</Link>

            <Notifications />

            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register" className="nav-register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
