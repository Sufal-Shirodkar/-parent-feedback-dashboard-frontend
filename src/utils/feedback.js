const FULL_ACCESS_ROLES = new Set(["lead", "coordinator"]);

export const EMPTY_FILTERS = {
  search: "",
  priority: "",
  status: "",
  classLabel: "",
  rating: "",
  dateFrom: "",
  dateTo: "",
};

export function normalizeRole(value) {
  const role = String(value || "")
    .trim()
    .toLowerCase();

  if (role === "lead" || role === "coordinator" || role === "tutor") {
    return role;
  }

  return "";
}

export function normalizeClasses(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function canViewParentDetails(role) {
  return FULL_ACCESS_ROLES.has(normalizeRole(role));
}

export function formatRoleLabel(role) {
  const normalized = normalizeRole(role);

  if (!normalized) {
    return "Staff";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatBoolean(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "—";
}

export function getParentDisplay(item, role) {
  if (!canViewParentDetails(role)) {
    return "Hidden";
  }

  return item.parentName?.trim() || "—";
}

export function getCommentsDisplay(item, role) {
  if (!canViewParentDetails(role)) {
    return "Hidden";
  }

  return item.comments?.trim() || "—";
}

function isContactRequested(item) {
  const value = item.contactRequested ?? item.contact_request;

  if (value === true || value === 1) {
    return true;
  }

  if (typeof value === "string") {
    return ["yes", "true", "1"].includes(value.trim().toLowerCase());
  }

  return false;
}

export function getSummaryCounts(items) {
  return items.reduce(
    (counts, item) => {
      counts.total += 1;

      if (item.priority === "urgent" || item.priority === "high") {
        counts.highUrgent += 1;
      }

      if (isContactRequested(item)) {
        counts.contactRequested += 1;
      }

      if (item.continuing === "No") {
        counts.notContinuing += 1;
      }

      if (item.status === "open") {
        counts.open += 1;
      }

      if (item.status === "handled") {
        counts.handled += 1;
      }

      return counts;
    },
    {
      total: 0,
      highUrgent: 0,
      contactRequested: 0,
      notContinuing: 0,
      open: 0,
      handled: 0,
    }
  );
}

function matchesDateFilter(item, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return true;
  }

  if (!item.createdAt) {
    return false;
  }

  const created = new Date(item.createdAt);

  if (Number.isNaN(created.getTime())) {
    return false;
  }

  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`);
    if (created < from) {
      return false;
    }
  }

  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999`);
    if (created > to) {
      return false;
    }
  }

  return true;
}

export function filterFeedback(items, filters, role) {
  const query = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.priority && item.priority !== filters.priority) {
      return false;
    }

    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.classLabel && item.classLabel !== filters.classLabel) {
      return false;
    }

    if (filters.rating && String(item.rating) !== String(filters.rating)) {
      return false;
    }

    if (!matchesDateFilter(item, filters.dateFrom, filters.dateTo)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      canViewParentDetails(role) ? item.parentName : "",
      item.studentName,
      item.classLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getUniqueClasses(items) {
  return [...new Set(items.map((item) => item.classLabel).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

export function getLoginErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Unable to sign in. Please try again.";
  }
}
