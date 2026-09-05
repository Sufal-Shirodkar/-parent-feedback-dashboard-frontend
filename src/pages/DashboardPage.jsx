import { useMemo, useState } from "react";
import FeedbackDetails from "../components/FeedbackDetails";
import FeedbackFilters from "../components/FeedbackFilters";
import FeedbackPagination from "../components/FeedbackPagination";
import FeedbackTable from "../components/FeedbackTable";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SummaryCards from "../components/SummaryCards";
import WeeklyDigest from "../components/WeeklyDigest";
import { useAuth } from "../hooks/useAuth";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFeedback } from "../hooks/useFeedback";
import {
  EMPTY_FILTERS,
  filterFeedback,
  getSummaryCounts,
  getUniqueClasses,
} from "../utils/feedback";

export default function DashboardPage() {
  const { identity, logout, authError } = useAuth();
  const { items, pagination, loading, error, reload, goToPage, markHandled } =
    useFeedback();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [handling, setHandling] = useState(false);
  const [handleError, setHandleError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const appliedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const role = identity?.role || "";
  const visibleItems = useMemo(
    () => filterFeedback(items, appliedFilters, role),
    [items, appliedFilters, role]
  );
  const counts = useMemo(() => getSummaryCounts(visibleItems), [visibleItems]);
  const classes = useMemo(() => getUniqueClasses(items), [items]);

  async function handleLogout() {
    setLogoutError("");

    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  async function handleMarkHandled(item) {
    setHandleError("");
    setHandling(true);

    try {
      await markHandled(item.id);
      setSelected((current) =>
        current && current.id === item.id
          ? { ...current, status: "handled", handledAt: new Date().toISOString() }
          : current
      );
    } catch (markError) {
      setHandleError(markError.message || "Unable to mark this feedback as handled.");
    } finally {
      setHandling(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-main">
        <Header
          identity={identity}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />

        <main className="dashboard">
          {(authError || logoutError) && (
            <p className="form-message is-error" role="alert">
              {logoutError || authError}
            </p>
          )}

          <SummaryCards counts={counts} />
          <WeeklyDigest />
          <FeedbackFilters
            filters={filters}
            classes={classes}
            onChange={setFilters}
            onReset={setFilters}
          />

          {loading && (
            <div className="empty-state" role="status">
              Loading feedback...
            </div>
          )}

          {!loading && error && (
            <div className="empty-state is-error" role="alert">
              <p>{error}</p>
              <button type="button" className="button" onClick={reload}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && pagination.total === 0 && (
            <div className="empty-state" role="status">
              No feedback has been received yet.
            </div>
          )}

          {!loading && !error && pagination.total > 0 && (
            <>
              <FeedbackTable
                items={visibleItems}
                role={role}
                onSelect={(item) => {
                  setHandleError("");
                  setSelected(item);
                }}
              />
              <FeedbackPagination
                pagination={pagination}
                onPageChange={goToPage}
              />
            </>
          )}
        </main>
      </div>

      {selected && (
        <FeedbackDetails
          item={selected}
          role={role}
          onClose={() => {
            setSelected(null);
            setHandleError("");
          }}
          onMarkHandled={handleMarkHandled}
          handling={handling}
          handleError={handleError}
        />
      )}
    </div>
  );
}
