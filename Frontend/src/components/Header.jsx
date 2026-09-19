import "../styles/header.css";

function Header() {
  return (
    <header className="app-header">
      <div>
        <h1>Salesforce CRUD Dashboard</h1>
        <p>Manage your Salesforce records</p>
      </div>

      <div className="connection-status">
        <span className="status-dot"></span>
        Salesforce Connected
      </div>
    </header>
  );
}

export default Header;