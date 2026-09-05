import { ApiError } from "./client";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

let staffCache = null;
let staffRequest = null;

function rosterUrl() {
  if (!API_BASE_URL) {
    throw new ApiError("Missing VITE_API_BASE_URL. Add it to your .env file.", 500);
  }

  return `${API_BASE_URL}/api/roster`;
}

function rosterErrorMessage(payload, status) {
  if (payload?.message) {
    return payload.message;
  }

  if (status === 401) {
    return "Staff roster is not authorized.";
  }

  if (status === 429) {
    return "Staff roster is temporarily rate limited. Please try again shortly.";
  }

  return "Unable to load the staff roster.";
}

export async function getRosterStaff() {
  if (staffCache) {
    return staffCache;
  }

  if (staffRequest) {
    return staffRequest;
  }

  staffRequest = (async () => {
    let response;

    try {
      response = await fetch(rosterUrl(), {
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new ApiError("Unable to reach the staff roster. Please try again.", 0);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(rosterErrorMessage(payload, response.status), response.status);
    }

    const staff = Array.isArray(payload?.staff) ? payload.staff : [];
    staffCache = staff;
    return staffCache;
  })().finally(() => {
    staffRequest = null;
  });

  return staffRequest;
}

export async function findStaffByEmail(email) {
  const needle = String(email || "")
    .trim()
    .toLowerCase();

  if (!needle) {
    return null;
  }

  const staff = await getRosterStaff();
  return (
    staff.find((person) => String(person.email || "").trim().toLowerCase() === needle) ||
    null
  );
}
