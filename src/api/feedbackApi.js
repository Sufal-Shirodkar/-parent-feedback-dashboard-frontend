import { apiRequest } from "./client";

export async function getFeedback(getAccessContext, { page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const payload = await apiRequest(
    `/api/feedback?${params.toString()}`,
    { method: "GET" },
    getAccessContext
  );

  return {
    feedback: Array.isArray(payload?.feedback) ? payload.feedback : [],
    pagination: {
      page: Number(payload?.pagination?.page) || page,
      limit: Number(payload?.pagination?.limit) || limit,
      total: Number(payload?.pagination?.total) || 0,
      totalPages: Number(payload?.pagination?.totalPages) || 1,
    },
  };
}

export async function markFeedbackHandled(id, getAccessContext) {
  if (!id) {
    throw new Error("Feedback id is required.");
  }

  return apiRequest(
    `/api/feedback/${encodeURIComponent(id)}/handled`,
    { method: "PATCH" },
    getAccessContext
  );
}
