import { apiClient } from "./client";
import type { CompareResponse, SummarizeResponse, SummaryType } from "@/types";

export async function summarizeDocument(documentId: string, summaryType: SummaryType): Promise<SummarizeResponse> {
  const { data } = await apiClient.post<SummarizeResponse>(`/api/documents/${documentId}/summarize`, {
    summary_type: summaryType,
  });
  return data;
}

export async function compareDocuments(documentIdA: string, documentIdB: string): Promise<CompareResponse> {
  const { data } = await apiClient.post<CompareResponse>("/api/documents/compare", {
    document_id_a: documentIdA,
    document_id_b: documentIdB,
  });
  return data;
}
