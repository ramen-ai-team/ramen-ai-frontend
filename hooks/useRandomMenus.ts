import { useCallback, useEffect, useState } from "react";
import { apiService } from "../lib/api-client";
import { MenuItem } from "../types/api";

export const useRandomMenus = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRandomMenus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getRandomMenus();

      if (data && Array.isArray(data.menus)) {
        setMenus(data.menus);
      } else {
        setError(new Error("Invalid data format received from API"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomMenus();
  }, [fetchRandomMenus]);

  return { menus, loading, error, refetch: fetchRandomMenus };
};
