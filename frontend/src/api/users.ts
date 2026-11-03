import { apiClient } from "./client";
import type { User, UserCreatePayload, UserUpdatePayload } from "@/types";

export async function listUsers(skip = 0, limit = 100): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/api/users", { params: { skip, limit } });
  return data;
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const { data } = await apiClient.post<User>("/api/users", payload);
  return data;
}

export async function updateUser(id: string, payload: UserUpdatePayload): Promise<User> {
  const { data } = await apiClient.patch<User>(`/api/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/api/users/${id}`);
}
