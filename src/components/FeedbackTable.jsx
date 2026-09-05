import { PriorityBadge, StatusBadge } from "./Badge";
import { formatDate, getCommentsDisplay, getParentDisplay } from "../utils/feedback";

export default function FeedbackTable({ items, role, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="empty-state" role="status">
        No feedback matches the current filters.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="feedback-table">
        <thead>
          <tr>
            <th>Parent</th>
            <th>Student</th>
            <th>Class</th>
            <th>Rating</th>
            <th>Continuing</th>
            <th>Comments</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => onSelect(item)}>
              <td>{getParentDisplay(item, role)}</td>
              <td>{item.studentName || "—"}</td>
              <td>{item.classLabel || "—"}</td>
              <td>{item.rating ?? "—"}</td>
              <td>{item.continuing || "—"}</td>
              <td className="comments-cell">{getCommentsDisplay(item, role)}</td>
              <td>
                <PriorityBadge priority={item.priority} />
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(item);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
