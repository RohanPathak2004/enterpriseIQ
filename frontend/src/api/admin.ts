import { apiClient } from "./client";
import type { AdminStatsResponse, AuditLog } from "@/types";

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  const { data } = await apiClient.get<AdminStatsResponse>("/api/admin/stats");
  return data;
}

export interface ListAuditLogsParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  created_after?: string;
  created_before?: string;
}

export async function listAuditLogs(params: ListAuditLogsParams = {}): Promise<AuditLog[]> {
  const { data } = await apiClient.get<AuditLog[]>("/api/admin/audit-logs", { params });
  return data;
}
