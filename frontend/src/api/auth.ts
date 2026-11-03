import { apiClient } from "./client";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "@/types";

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/api/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/api/auth/register", payload);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/auth/me");
  return data;
}
