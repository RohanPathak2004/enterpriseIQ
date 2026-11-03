/**
 * TypeScript mirrors of the backend's Pydantic schemas
 * (backend/app/schemas/*.py). Keep in sync with the API.
 */

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type ProcessingStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type DocumentVisibility = "PUBLIC" | "RESTRICTED";

export type GranteeType = "ROLE" | "USER";

export type MessageRole = "user" | "assistant";

export type SummaryType = "SHORT" | "DETAILED" | "EXECUTIVE";

// --- Auth / users ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdatePayload {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

// --- Documents ---

export interface Document {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  processing_status: ProcessingStatus;
  processing_error: string | null;
  page_count: number | null;
  chunk_count: number;
  visibility: DocumentVisibility;
  created_at: string;
  updated_at: string;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  grantee_type: GranteeType;
  role: UserRole | null;
  user_id: string | null;
  created_at: string;
}

export interface DocumentPermissionCreatePayload {
  grantee_type: GranteeType;
  role?: UserRole | null;
  user_id?: string | null;
}

// --- Search ---

export interface SearchResultItem {
  document_id: string;
  document_name: string;
  chunk_id: string;
  excerpt: string;
  page_number: number | null;
  section_title: string | null;
  relevance_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

export interface SearchFilters {
  file_type?: string;
  uploaded_by?: string;
  created_after?: string;
  created_before?: string;
  top_k?: number;
  similarity_threshold?: number;
}

// --- Chat ---

export interface ChatSource {
  document_id: string;
  document_name: string;
  chunk_id: string;
  page: number | null;
  section_title: string | null;
  excerpt: string;
  relevance_score: number;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  sources: ChatSource[];
}

export interface MessageSource {
  chunk_id: string | null;
  document_id: string | null;
  document_name: string | null;
  page: number | null;
  section_title: string | null;
  excerpt: string | null;
  relevance_score: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  sources: MessageSource[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: Message[];
}

// --- Summaries / comparison ---

export interface SummarizeResponse {
  document_id: string;
  document_name: string;
  summary_type: SummaryType;
  summary: string;
  chunk_count: number;
  map_reduce_used: boolean;
}

export interface DocumentRef {
  id: string;
  name: string;
}

export interface ComparisonCategory {
  category: string;
  differences: string[];
}

export interface CompareResponse {
  document_a: DocumentRef;
  document_b: DocumentRef;
  overview: string;
  categories: ComparisonCategory[];
  additions: string[];
  removals: string[];
  used_summaries: boolean;
}

// --- Dashboard ---

export interface DashboardResponse {
  documents_visible_total: number;
  documents_by_status: Record<string, number>;
  my_uploaded_documents: number;
  my_conversations_total: number;
  recent_conversations: ConversationSummary[];
  recent_documents: Document[];
}

// --- Admin ---

export interface SearchQueryFrequency {
  query: string;
  count: number;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminStatsResponse {
  total_documents: number;
  documents_by_status: Record<string, number>;
  total_users: number;
  users_by_role: Record<string, number>;
  total_conversations: number;
  recent_uploads: Document[];
  most_searched_queries: SearchQueryFrequency[];
  recent_activity: AuditLog[];
}

// --- Errors ---

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
