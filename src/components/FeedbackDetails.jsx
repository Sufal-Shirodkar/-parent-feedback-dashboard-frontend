import { useEffect, useRef } from "react";
import { PriorityBadge, StatusBadge } from "./Badge";
import {
  formatBoolean,
  formatDate,
  getCommentsDisplay,
  getParentDisplay,
} from "../utils/feedback";

export default function FeedbackDetails({
  item,
  role,
  onClose,
  onMarkHandled,
  handling,
  handleError,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!item) {
    return null;
  }

  const alreadyHandled = item.status === "handled";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="sidebar-kicker">Feedback details</p>
            <h2 id="feedback-details-title">{item.studentName || "Student"}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <dl className="details-grid">
          <div>
            <dt>Parent</dt>
            <dd>{getParentDisplay(item, role)}</dd>
          </div>
          <div>
            <dt>Student</dt>
            <dd>{item.studentName || "—"}</dd>
          </div>
          <div>
            <dt>Class</dt>
            <dd>{item.classLabel || "—"}</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>{item.rating ?? "—"}</dd>
          </div>
          <div>
            <dt>Continuing</dt>
            <dd>{item.continuing || "—"}</dd>
          </div>
          <div>
            <dt>Contact requested</dt>
            <dd>{formatBoolean(item.contactRequested)}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <PriorityBadge priority={item.priority} />
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={item.status} />
            </dd>
          </div>
          <div>
            <dt>Created date</dt>
            <dd>{formatDate(item.createdAt)}</dd>
          </div>
          <div className="details-span">
            <dt>Comments</dt>
            <dd>{getCommentsDisplay(item, role)}</dd>
          </div>
        </dl>

        {handleError && (
          <p className="form-message is-error" role="alert">
            {handleError}
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="button"
            onClick={() => onMarkHandled(item)}
            disabled={alreadyHandled || handling}
          >
            {alreadyHandled
              ? "Already handled"
              : handling
                ? "Saving..."
                : "Mark as Handled"}
          </button>
        </div>
      </div>
    </div>
  );
}
