import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileStack, MessagesSquare, FolderUp, Files, ArrowRight } from "lucide-react";
import { fetchDashboard } from "@/api/dashboard";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge, statusTone } from "@/components/ui/Badge";
import { getApiErrorMessage } from "@/api/client";
import { formatRelativeTime } from "@/utils/format";
import { titleCase } from "@/utils/format";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileStack;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-panel">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-950/5 text-navy-900">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
          <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  const firstName = user?.name.split(" ")[0];

  if (isLoading) return <Spinner label="Loading your dashboard…" />;
  if (error) return <ErrorBanner message={getApiErrorMessage(error, "Couldn't load your dashboard.")} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Welcome back, {firstName}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Here's what's visible to you as a{user?.role === "ADMIN" ? "n" : ""} {user?.role.toLowerCase()}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Files} label="Documents you can see" value={data.documents_visible_total} />
        <StatCard icon={FolderUp} label="Uploaded by you" value={data.my_uploaded_documents} />
        <StatCard icon={MessagesSquare} label="Your conversations" value={data.my_conversations_total} />
        <StatCard
          icon={FileStack}
          label="Completed docs"
          value={data.documents_by_status["COMPLETED"] ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="font-display text-sm font-semibold text-ink">Recent documents</h3>
            <Link to="/documents" className="flex items-center gap-1 text-xs font-medium text-brass-dark hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {data.recent_documents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-faint">Nothing uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recent_documents.map((doc) => (
                <li key={doc.id} className="px-5 py-3">
                  <Link to={`/documents/${doc.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{doc.original_filename}</p>
                      <p className="text-xs text-ink-faint">{formatRelativeTime(doc.created_at)}</p>
                    </div>
                    <Badge tone={statusTone(doc.processing_status)}>{titleCase(doc.processing_status)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border bg-white shadow-panel">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="font-display text-sm font-semibold text-ink">Recent conversations</h3>
            <Link to="/chat" className="flex items-center gap-1 text-xs font-medium text-brass-dark hover:underline">
              Open chat <ArrowRight size={12} />
            </Link>
          </div>
          {data.recent_conversations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-faint">No conversations yet — ask a question to start one.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recent_conversations.map((c) => (
                <li key={c.id} className="px-5 py-3">
                  <Link to={`/chat/${c.id}`} className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-ink">{c.title ?? "Untitled conversation"}</p>
                    <p className="shrink-0 text-xs text-ink-faint">{formatRelativeTime(c.updated_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
        <h3 className="font-display text-sm font-semibold text-ink">Documents by status</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(data.documents_by_status).map(([status, count]) => (
            <Badge key={status} tone={statusTone(status)}>
              {titleCase(status)}: {count}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
