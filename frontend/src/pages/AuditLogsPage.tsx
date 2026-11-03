import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { listAuditLogs } from "@/api/admin";
import { getApiErrorMessage } from "@/api/client";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { formatDateTime, titleCase } from "@/utils/format";

const PAGE_SIZE = 50;

export function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", page, action],
    queryFn: () => listAuditLogs({ skip: page * PAGE_SIZE, limit: PAGE_SIZE, action: action || undefined }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">Every recorded event, across every user — for accountability, not day-to-day use.</p>
        <Field label="" htmlFor="action-filter">
          <input
            id="action-filter"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            placeholder="Filter by action…"
            className={`${inputClass} w-56`}
          />
        </Field>
      </div>

      {isLoading && <Spinner label="Loading audit log…" />}
      {error && <ErrorBanner message={getApiErrorMessage(error, "Couldn't load the audit log.")} />}

      {data && data.length === 0 && (
        <EmptyState icon={ScrollText} title="No matching events" description="Try clearing the action filter." />
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-paper/60 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((log) => (
                <tr key={log.id} className="hover:bg-paper/40">
                  <td className="px-5 py-3 font-medium text-ink">{titleCase(log.action)}</td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-ink-muted">{log.resource ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {log.user_id ? `${log.user_id.slice(0, 8)}…` : "system"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (data.length === PAGE_SIZE || page > 0) && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>Page {page + 1}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={data.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
