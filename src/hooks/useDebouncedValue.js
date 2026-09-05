import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedValue(value),
      value ? delay : 0
    );

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
