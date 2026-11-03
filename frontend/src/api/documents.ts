import { apiClient } from "./client";
import type {
  Document,
  DocumentPermission,
  DocumentPermissionCreatePayload,
  DocumentVisibility,
  ProcessingStatus,
} from "@/types";

export interface ListDocumentsParams {
  skip?: number;
  limit?: number;
  file_type?: string;
  status?: ProcessingStatus;
}

export async function listDocuments(params: ListDocumentsParams = {}): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>("/api/documents", { params });
  return data;
}

export async function getDocument(id: string): Promise<Document> {
  const { data } = await apiClient.get<Document>(`/api/documents/${id}`);
  return data;
}

export async function uploadDocument(
  file: File,
  visibility: DocumentVisibility,
  onProgress?: (percent: number) => void
): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<Document>("/api/documents", form, {
    params: { visibility },
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

export async function updateDocumentVisibility(id: string, visibility: DocumentVisibility): Promise<Document> {
  const { data } = await apiClient.patch<Document>(`/api/documents/${id}`, { visibility });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/api/documents/${id}`);
}

export function downloadUrl(id: string): string {
  return `${apiClient.defaults.baseURL}/api/documents/${id}/download`;
}

export async function downloadDocument(id: string, filename: string): Promise<void> {
  const response = await apiClient.get(`/api/documents/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function listPermissions(documentId: string): Promise<DocumentPermission[]> {
  const { data } = await apiClient.get<DocumentPermission[]>(`/api/documents/${documentId}/permissions`);
  return data;
}

export async function addPermission(
  documentId: string,
  payload: DocumentPermissionCreatePayload
): Promise<DocumentPermission> {
  const { data } = await apiClient.post<DocumentPermission>(`/api/documents/${documentId}/permissions`, payload);
  return data;
}

export async function revokePermission(documentId: string, permissionId: string): Promise<void> {
  await apiClient.delete(`/api/documents/${documentId}/permissions/${permissionId}`);
}
