import { apiClient } from "./client";
import type { ChatResponse, ConversationDetail, ConversationSummary } from "@/types";

export async function sendMessage(
  question: string,
  conversationId?: string,
  topK?: number,
  similarityThreshold?: number
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/api/chat", {
    question,
    conversation_id: conversationId,
    top_k: topK,
    similarity_threshold: similarityThreshold,
  });
  return data;
}

export async function listConversations(skip = 0, limit = 50): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<ConversationSummary[]>("/api/conversations", { params: { skip, limit } });
  return data;
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const { data } = await apiClient.get<ConversationDetail>(`/api/conversations/${id}`);
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await apiClient.delete(`/api/conversations/${id}`);
}
