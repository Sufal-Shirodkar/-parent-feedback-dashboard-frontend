const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toHeaderValue(value) {
  return String(value || "")
    .replace(/[\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getErrorMessage(payload, status) {
  if (payload?.message === "Missing dashboard identity headers") {
    return "Your staff role is not assigned yet. Ask a lead to grant dashboard access.";
  }

  if (payload?.message === "Tutors must have assigned classes") {
    return "Your account does not have assigned classes yet.";
  }

  if (payload?.message === "Invalid role") {
    return "Your account is not allowed to access this dashboard.";
  }

  if (payload?.message) {
    return payload.message;
  }

  if (status === 401) {
    return "Your session is not authorized to load this dashboard.";
  }

  if (status === 403) {
    return "You do not have access to this feedback.";
  }

  if (status === 404) {
    return "The requested feedback could not be found.";
  }

  return "Something went wrong while talking to the server.";
}

export async function apiRequest(path, options = {}, getAccessContext) {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Missing VITE_API_BASE_URL. Add it to your .env file.",
      500
    );
  }

  if (typeof getAccessContext !== "function") {
    throw new ApiError("Authentication context is not available.", 401);
  }

  const access = await getAccessContext();

  if (!access?.token) {
    throw new ApiError("You need to sign in again to continue.", 401);
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${access.token}`,
    ...options.headers,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (access.uid) {
    headers["X-User-Uid"] = toHeaderValue(access.uid);
  }

  if (access.name) {
    headers["X-User-Name"] = toHeaderValue(access.name);
  }

  if (access.role) {
    headers["X-User-Role"] = toHeaderValue(access.role);
  }

  if (access.classes?.length) {
    headers["X-User-Classes"] = access.classes
      .map((classLabel) => toHeaderValue(classLabel))
      .filter(Boolean)
      .join(",");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the feedback service. Check your connection and try again.",
      0
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  return payload;
}
