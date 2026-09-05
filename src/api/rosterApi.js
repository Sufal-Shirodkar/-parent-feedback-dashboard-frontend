import { ApiError } from "./client";

const ROSTER_API_URL = (
  import.meta.env.VITE_ROSTER_API_URL ||
  (import.meta.env.DEV ? "/api/roster" : "https://contourcandidate.web.app/api/roster")
).replace(/\/$/, "");
const ROSTER_API_KEY = import.meta.env.VITE_ROSTER_API_KEY || "";

let staffCache = null;
let staffRequest = null;

function rosterUrl(page) {
  const url = new URL(
    ROSTER_API_URL,
    typeof window === "undefined" ? "http://localhost" : window.location.origin
  );
  url.searchParams.set("page", String(page));
  if (ROSTER_API_KEY) {
    url.searchParams.set("api_key", ROSTER_API_KEY);
  }
  return url.toString();
}

async function fetchRosterPage(page) {
  let response;

  try {
    response = await fetch(rosterUrl(page), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError("Unable to reach the staff roster. Please try again.", 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError("Unable to load the staff roster.", response.status);
  }

  return payload;
}

export async function getRosterStaff() {
  if (staffCache) {
    return staffCache;
  }

  if (staffRequest) {
    return staffRequest;
  }

  staffRequest = (async () => {
    const staff = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const payload = await fetchRosterPage(page);
      staff.push(...(payload?.staff || []));
      totalPages = Number(payload?.total_pages) || page;
      page += 1;
    }

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
