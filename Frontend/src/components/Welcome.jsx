import "../styles/welcome.css";

function Welcome({ onLogin }) {
  return (
    <main className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-eyebrow">
            SALESFORCE CRUD DASHBOARD
          </span>

          <h1>Welcome to Salesforce Dashboard</h1>

          <p>
            Connect your Salesforce account to manage records from a
            simple and centralized web interface.
          </p>

          <div className="welcome-features">
            <div className="welcome-feature">
              <span className="feature-number">01</span>
              <div>
                <h3>Manage Records</h3>
                <p>View and manage Salesforce records directly.</p>
              </div>
            </div>

            <div className="welcome-feature">
              <span className="feature-number">02</span>
              <div>
                <h3>CRUD Operations</h3>
                <p>Create, edit, view, and delete records.</p>
              </div>
            </div>

            <div className="welcome-feature">
              <span className="feature-number">03</span>
              <div>
                <h3>Secure Connection</h3>
                <p>Connect through Salesforce OAuth authentication.</p>
              </div>
            </div>
          </div>

          <button
            className="welcome-login-button"
            onClick={onLogin}
          >
            Login with Salesforce
          </button>
        </div>
      </div>
    </main>
  );
}

export default Welcome;