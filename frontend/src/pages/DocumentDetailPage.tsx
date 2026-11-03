import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  GitCompareArrows,
  Lock,
  ShieldPlus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteDocument,
  downloadDocument,
  getDocument,
  listDocuments,
  updateDocumentVisibility,
} from "@/api/documents";
import { addPermission, listPermissions, revokePermission } from "@/api/documents";
import { compareDocuments, summarizeDocument } from "@/api/summaries";
import { listUsers } from "@/api/users";
import type { DocumentVisibility, GranteeType, SummaryType, UserRole } from "@/types";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime, formatFileSize, titleCase } from "@/utils/format";

function SummaryPanel({ documentId }: { documentId: string }) {
  const [type, setType] = useState<SummaryType>("SHORT");
  const mutation = useMutation({
    mutationFn: () => summarizeDocument(documentId, type),
  });

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Sparkles size={15} className="text-brass-dark" /> Summarize
        </h3>
        <div className="flex items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value as SummaryType)} className={`${inputClass} w-auto`}>
            <option value="SHORT">Short</option>
            <option value="DETAILED">Detailed</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
          <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Generate
          </Button>
        </div>
      </div>

      {mutation.isError && <div className="mt-4"><ErrorBanner message={getApiErrorMessage(mutation.error, "Couldn't summarize this document.")} /></div>}

      {mutation.data && (
        <div className="mt-4 rounded-md bg-paper p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{mutation.data.summary}</p>
          <p className="mt-3 text-xs text-ink-faint">
            Based on {mutation.data.chunk_count} chunk{mutation.data.chunk_count === 1 ? "" : "s"}
            {mutation.data.map_reduce_used ? " · summarized in stages (map-reduce)" : ""}
          </p>
        </div>
      )}
    </section>
  );
}

function ComparePanel({ documentId }: { documentId: string }) {
  const [otherId, setOtherId] = useState("");
  const { data: docs } = useQuery({ queryKey: ["documents", "compare-list"], queryFn: () => listDocuments({ limit: 200 }) });
  const mutation = useMutation({
    mutationFn: () => compareDocuments(documentId, otherId),
  });

  const options = (docs ?? []).filter((d) => d.id !== documentId && d.processing_status === "COMPLETED");

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <GitCompareArrows size={15} className="text-brass-dark" /> Compare with another document
        </h3>
        <div className="flex items-center gap-2">
          <select value={otherId} onChange={(e) => setOtherId(e.target.value)} className={`${inputClass} w-56`}>
            <option value="">Choose a document…</option>
            {options.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename}
              </option>
            ))}
          </select>
          <Button size="sm" disabled={!otherId} loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Compare
          </Button>
        </div>
      </div>

      {mutation.isError && <div className="mt-4"><ErrorBanner message={getApiErrorMessage(mutation.error, "Couldn't compare these documents.")} /></div>}

      {mutation.data && (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-ink">{mutation.data.overview}</p>

          {mutation.data.categories.map((cat) => (
            <div key={cat.category}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{cat.category}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink">
                {cat.differences.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {mutation.data.additions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-signal-success">
                  Only in {mutation.data.document_b.name}
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink">
                  {mutation.data.additions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {mutation.data.removals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-signal-danger">
                  Only in {mutation.data.document_a.name}
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink">
                  {mutation.data.removals.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {mutation.data.used_summaries && (
            <p className="text-xs text-ink-faint">Long documents — this comparison used their summaries.</p>
          )}
        </div>
      )}
    </section>
  );
}

function AddPermissionModal({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const [granteeType, setGranteeType] = useState<GranteeType>("ROLE");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [userId, setUserId] = useState("");
  const { data: users } = useQuery({ queryKey: ["users", "for-permissions"], queryFn: () => listUsers(0, 200) });
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      addPermission(documentId, {
        grantee_type: granteeType,
        role: granteeType === "ROLE" ? role : undefined,
        user_id: granteeType === "USER" ? userId : undefined,
      }),
    onSuccess: () => {
      notify("Access granted.", "success");
      queryClient.invalidateQueries({ queryKey: ["permissions", documentId] });
      onClose();
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't grant access."), "error"),
  });

  return (
    <Modal title="Grant access" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        {mutation.isError && <ErrorBanner message={getApiErrorMessage(mutation.error, "Couldn't grant access.")} />}
        <Field label="Grant to" htmlFor="granteeType">
          <select
            id="granteeType"
            value={granteeType}
            onChange={(e) => setGranteeType(e.target.value as GranteeType)}
            className={inputClass}
          >
            <option value="ROLE">An entire role</option>
            <option value="USER">A specific person</option>
          </select>
        </Field>
        {granteeType === "ROLE" ? (
          <Field label="Role" htmlFor="role">
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>
        ) : (
          <Field label="Person" htmlFor="userId">
            <select id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass} required>
              <option value="">Choose a person…</option>
              {(users ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Grant access
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PermissionsPanel({ documentId }: { documentId: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["permissions", documentId],
    queryFn: () => listPermissions(documentId),
  });

  const revokeMutation = useMutation({
    mutationFn: (permissionId: string) => revokePermission(documentId, permissionId),
    onSuccess: () => {
      notify("Access revoked.", "success");
      queryClient.invalidateQueries({ queryKey: ["permissions", documentId] });
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't revoke access."), "error"),
  });

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <ShieldPlus size={15} className="text-brass-dark" /> Access grants
        </h3>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
          Grant access
        </Button>
      </div>

      {isLoading && <p className="mt-3 text-sm text-ink-faint">Loading…</p>}
      {data && data.length === 0 && (
        <p className="mt-3 text-sm text-ink-faint">No explicit grants yet — only public visibility applies.</p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-3 divide-y divide-border">
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">
                {p.grantee_type === "ROLE" ? `Role: ${p.role}` : `Person: ${p.user_id}`}
              </span>
              <button
                onClick={() => revokeMutation.mutate(p.id)}
                className="rounded p-1 text-ink-faint hover:bg-signal-danger/10 hover:text-signal-danger"
                title="Revoke"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAdd && <AddPermissionModal documentId={documentId} onClose={() => setShowAdd(false)} />}
    </section>
  );
}

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: doc, isLoading, error } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => getDocument(documentId as string),
    enabled: !!documentId,
  });

  const visibilityMutation = useMutation({
    mutationFn: (visibility: DocumentVisibility) => updateDocumentVisibility(documentId as string, visibility),
    onSuccess: () => {
      notify("Visibility updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't update visibility."), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId as string),
    onSuccess: () => {
      notify("Document deleted.", "success");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't delete this document."), "error"),
  });

  if (isLoading) return <Spinner label="Loading document…" />;
  if (error) return <ErrorBanner message={getApiErrorMessage(error, "Couldn't load this document.")} />;
  if (!doc) return null;

  const canManage = (user?.role === "ADMIN" || user?.role === "MANAGER") && (user?.role === "ADMIN" || user?.id === doc.uploaded_by);
  const canSummarizeOrCompare = doc.processing_status === "COMPLETED";

  return (
    <div className="space-y-6">
      <Link to="/documents" className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> Back to documents
      </Link>

      <div className="rounded-lg border border-border bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-navy-950/5 text-navy-900">
              <FileText size={19} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{doc.original_filename}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(doc.processing_status)}>{titleCase(doc.processing_status)}</Badge>
                <Badge tone={statusTone(doc.visibility)}>
                  <Lock size={10} /> {titleCase(doc.visibility)}
                </Badge>
                <span className="text-xs text-ink-faint">{doc.file_type.toUpperCase()}</span>
                <span className="text-xs text-ink-faint">{formatFileSize(doc.file_size)}</span>
                {doc.page_count != null && <span className="text-xs text-ink-faint">{doc.page_count} pages</span>}
                <span className="text-xs text-ink-faint">{doc.chunk_count} chunks</span>
              </div>
              {doc.processing_error && (
                <p className="mt-2 text-xs text-signal-danger">{doc.processing_error}</p>
              )}
              <p className="mt-2 text-xs text-ink-faint">Uploaded {formatDateTime(doc.created_at)}</p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => downloadDocument(doc.id, doc.original_filename)}>
              <Download size={14} /> Download
            </Button>
            {canManage && (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>
        </div>

        {canManage && (
          <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-medium text-ink">Visibility</span>
            <select
              value={doc.visibility}
              onChange={(e) => visibilityMutation.mutate(e.target.value as DocumentVisibility)}
              className={`${inputClass} w-auto`}
              disabled={visibilityMutation.isPending}
            >
              <option value="RESTRICTED">Restricted</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>
        )}
      </div>

      {canSummarizeOrCompare ? (
        <>
          <SummaryPanel documentId={doc.id} />
          <ComparePanel documentId={doc.id} />
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-white px-5 py-4 text-sm text-ink-faint">
          Summarizing and comparison are available once this document finishes processing.
        </p>
      )}

      <RoleGate roles={["ADMIN"]}>
        <PermissionsPanel documentId={doc.id} />
      </RoleGate>

      {confirmDelete && (
        <Modal title="Delete document" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-ink-muted">
            Delete <span className="font-medium text-ink">{doc.original_filename}</span>? This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
