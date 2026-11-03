import { apiClient } from "./client";
import type { SearchFilters, SearchResponse } from "@/types";

export async function search(query: string, filters: SearchFilters = {}): Promise<SearchResponse> {
  const { data } = await apiClient.post<SearchResponse>("/api/search", { query, ...filters });
  return data;
}
