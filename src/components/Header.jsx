import { formatRoleLabel } from "../utils/feedback";

export default function Header({ identity, onLogout, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="header-start">
        <button
          type="button"
          className="menu-button"
          onClick={onToggleSidebar}
          aria-controls="app-sidebar"
          aria-label="Open navigation"
        >
          Menu
        </button>
        <div>
          <h1>Feedback dashboard</h1>
          <p>Review parent feedback and follow up where needed.</p>
        </div>
      </div>

      <div className="header-end">
        <div className="user-meta">
          <strong>{identity?.name || "Staff"}</strong>
          <span>{formatRoleLabel(identity?.role)}</span>
        </div>
        <button type="button" className="button button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
