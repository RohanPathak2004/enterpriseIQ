import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { DocumentDetailPage } from "@/pages/DocumentDetailPage";
import { SearchPage } from "@/pages/SearchPage";
import { ChatPage } from "@/pages/ChatPage";
import { UsersPage } from "@/pages/UsersPage";
import { AdminStatsPage } from "@/pages/AdminStatsPage";
import { AuditLogsPage } from "@/pages/AuditLogsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/documents/:documentId" element={<DocumentDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:conversationId" element={<ChatPage />} />

                  <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/admin" element={<AdminStatsPage />} />
                    <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
