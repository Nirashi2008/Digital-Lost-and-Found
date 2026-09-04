import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="badge">COLLEGE DIGITAL SERVICE</p>

          <h1>
            Lost Something?
            <br />
            <span>Let's Find It.</span>
          </h1>

          <p className="hero-text">
            A simple digital platform for reporting lost and found items
            across your college campus.
          </p>

          <div className="hero-buttons">
            <Link to="/report-lost" className="primary-btn">
              Report Lost Item
            </Link>

            <Link to="/found-items" className="secondary-btn">
              Browse Found Items
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <p>HOW IT WORKS</p>
          <h2>Find it. Report it. Return it.</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📢</div>
            <h3>Report Lost</h3>
            <p>
              Tell the college community about your lost item with important
              details.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h3>Search Items</h3>
            <p>
              Search through reported found items using names, categories and
              locations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Claim Safely</h3>
            <p>
              Submit a claim and let the administrator verify ownership.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;