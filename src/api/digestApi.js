import { ApiError, apiRequest } from "./client";

function asText(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String).join("\n").trim();
  }

  return String(value || "").trim();
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  const text = asText(value);
  return text ? [text] : [];
}

function pick(source, keys) {
  for (const key of keys) {
    if (source?.[key] != null && source[key] !== "") {
      return source[key];
    }
  }

  return undefined;
}

export function normalizeWeeklyDigest(payload) {
  const source = payload?.digest || payload?.weeklyDigest || payload || {};

  return {
    overallVibe: asText(
      pick(source, ["overallVibe", "overall_vibe", "vibe", "overall"])
    ),
    urgentFires: asList(
      pick(source, ["urgentFires", "urgent_fires", "fires"])
    ),
    bigThemes: asList(pick(source, ["bigThemes", "big_themes", "themes"])),
    highPriorityFlags: asList(
      pick(source, ["highPriorityFlags", "high_priority_flags", "flags"])
    ),
    empty: Boolean(
      payload?.empty ||
        payload?.noFeedback ||
        source.empty ||
        source.noFeedback
    ),
  };
}

export function isEmptyWeeklyDigest(digest) {
  return (
    !digest ||
    digest.empty ||
    (!digest.overallVibe &&
      digest.urgentFires.length === 0 &&
      digest.bigThemes.length === 0 &&
      digest.highPriorityFlags.length === 0)
  );
}

export async function getWeeklyDigest(getAccessContext) {
  try {
    const payload = await apiRequest(
      "/api/ai/weekly-digest",
      { method: "GET" },
      getAccessContext
    );

    return normalizeWeeklyDigest(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new ApiError("The weekly digest is not available yet.", 404);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Unable to generate the weekly digest. Please try again.");
  }
}
