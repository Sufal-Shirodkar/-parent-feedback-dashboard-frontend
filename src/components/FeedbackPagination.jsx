export default function FeedbackPagination({ pagination, onPageChange }) {
  const { page, totalPages, total, limit } = pagination;

  if (!total || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="Feedback pages">
      <p className="muted">
        Showing {start}–{end} of {total}
      </p>
      <div className="pagination-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
