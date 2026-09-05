export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`} id="app-sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-kicker">Contour Education</p>
        <p className="sidebar-title">Parent Feedback</p>
      </div>

      <nav aria-label="Dashboard">
        <button
          type="button"
          className="nav-item is-active"
          onClick={onNavigate}
        >
          Dashboard
        </button>
      </nav>
    </aside>
  );
}
