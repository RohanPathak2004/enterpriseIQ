import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Files, MessagesSquare, Search as SearchIcon, Users2 } from "lucide-react";
import { fetchAdminStats } from "@/api/admin";
import { getApiErrorMessage } from "@/api/client";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatRelativeTime, titleCase } from "@/utils/format";

function StatCard({ icon: Icon, label, value }: { icon: typeof Files; label: string; value: number }) {
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

export function AdminStatsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });

  if (isLoading) return <Spinner label="Loading org stats…" />;
  if (error) return <ErrorBanner message={getApiErrorMessage(error, "Couldn't load org stats.")} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Files} label="Total documents" value={data.total_documents} />
        <StatCard icon={Users2} label="Total users" value={data.total_users} />
        <StatCard icon={MessagesSquare} label="Total conversations" value={data.total_conversations} />
        <StatCard icon={SearchIcon} label="Distinct search queries" value={data.most_searched_queries.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <h3 className="font-display text-sm font-semibold text-ink">Users by role</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(data.users_by_role).map(([role, count]) => (
              <Badge key={role} tone={statusTone(role)}>
                {titleCase(role)}: {count}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-white shadow-panel">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="font-display text-sm font-semibold text-ink">Most searched queries</h3>
          <p className="text-xs text-ink-faint">Counted by exact phrasing, not semantic topic.</p>
        </div>
        {data.most_searched_queries.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-faint">No searches recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.most_searched_queries.map((q, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="text-ink">{q.query}</span>
                <span className="font-mono text-xs text-ink-faint">{q.count}×</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="font-display text-sm font-semibold text-ink">Recent uploads</h3>
          <Link to="/documents" className="text-xs font-medium text-brass-dark hover:underline">
            View all
          </Link>
        </div>
        {data.recent_uploads.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-faint">Nothing uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recent_uploads.map((doc) => (
              <li key={doc.id} className="px-5 py-3">
                <Link to={`/documents/${doc.id}`} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink">{doc.original_filename}</span>
                  <span className="shrink-0 text-xs text-ink-faint">{formatRelativeTime(doc.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="font-display text-sm font-semibold text-ink">Recent activity</h3>
          <Link to="/admin/audit-logs" className="text-xs font-medium text-brass-dark hover:underline">
            Full audit log
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {data.recent_activity.map((log) => (
            <li key={log.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span className="text-ink">{titleCase(log.action)}</span>
              <span className="shrink-0 text-xs text-ink-faint">{formatRelativeTime(log.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
