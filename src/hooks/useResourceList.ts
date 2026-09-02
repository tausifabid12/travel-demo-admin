"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type ListResult } from "@/lib/client";
import { toast } from "@/components/ui";

/**
 * List state for every admin index page: debounced search, filters, paging,
 * and a reload that the delete/duplicate actions can call.
 */
export function useResourceList<T extends { _id: string }>(
  endpoint: string,
  initialFilters: Record<string, string> = {},
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("q", search);
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== "All") params.set(key, value);
      }

      const result = await api<ListResult<T>>(`${endpoint}?${params}`);
      setItems(result.items);
      setPages(result.pages);
      setTotal(result.total);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not load", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search, filters]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const setFilter = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const remove = async (id: string, label = "Item") => {
    try {
      await api(`${endpoint}/${id}`, { method: "DELETE" });
      toast(`${label} deleted`);
      await load();
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete", "error");
      return false;
    }
  };

  const duplicate = async (id: string) => {
    try {
      await api(`${endpoint}/${id}/duplicate`, { method: "POST" });
      toast("Duplicated as a new draft");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not duplicate", "error");
    }
  };

  const reorder = async (ids: string[]) => {
    // Optimistic: reflect the new order immediately, then persist.
    setItems((prev) => ids.map((id) => prev.find((i) => i._id === id)!).filter(Boolean));
    try {
      await api(`${endpoint}/reorder`, { method: "PATCH", json: { ids } });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save order", "error");
      await load();
    }
  };

  return {
    items,
    loading,
    search,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    filters,
    setFilter,
    page,
    pages,
    total,
    setPage,
    reload: load,
    remove,
    duplicate,
    reorder,
  };
}
