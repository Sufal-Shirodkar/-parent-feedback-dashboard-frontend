import { useCallback, useEffect, useState } from "react";
import { getFeedback, markFeedbackHandled } from "../api/feedbackApi";
import { useAuth } from "./useAuth";

const PAGE_SIZE = 10;

const EMPTY_PAGINATION = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export function useFeedback() {
  const { getAccessContext } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = useCallback(
    async (nextPage = page) => {
      try {
        const result = await getFeedback(getAccessContext, {
          page: nextPage,
          limit: PAGE_SIZE,
        });
        setItems(result.feedback);
        setPagination(result.pagination);
        setError("");
      } catch (loadError) {
        setItems([]);
        setPagination(EMPTY_PAGINATION);
        setError(loadError.message || "Unable to load feedback.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessContext, page]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getFeedback(getAccessContext, {
          page,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setItems(result.feedback);
          setPagination(result.pagination);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setItems([]);
          setPagination(EMPTY_PAGINATION);
          setError(loadError.message || "Unable to load feedback.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [getAccessContext, page]);

  const goToPage = useCallback((nextPage) => {
    setPage(nextPage);
    setLoading(true);
  }, []);

  const markHandled = useCallback(
    async (id) => {
      await markFeedbackHandled(id, getAccessContext);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "handled",
                handledAt: new Date().toISOString(),
              }
            : item
        )
      );
    },
    [getAccessContext]
  );

  return {
    items,
    pagination,
    page,
    loading,
    error,
    goToPage,
    reload: async () => {
      setLoading(true);
      await loadFeedback(page);
    },
    markHandled,
  };
}
