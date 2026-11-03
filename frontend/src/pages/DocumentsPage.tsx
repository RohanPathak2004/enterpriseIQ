import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, FileStack, Plus, Trash2, UploadCloud } from "lucide-react";
import { deleteDocument, downloadDocument, listDocuments, uploadDocument } from "@/api/documents";
import type { Document, DocumentVisibility, ProcessingStatus } from "@/types";
import { getApiErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClass } from "@/components/ui/Field";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatDate, formatFileSize, titleCase } from "@/utils/format";

const PAGE_SIZE = 20;

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<DocumentVisibility>("RESTRICTED");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const mutation = useMutation({
    mutationFn: () => uploadDocument(file as File, visibility, setProgress),
    onSuccess: () => {
      notify("Document uploaded. Processing in the background.", "success");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (err) => notify(getApiErrorMessage(err, "Upload failed."), "error"),
  });

  return (
    <Modal title="Upload a document" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (file) mutation.mutate();
        }}
        className="space-y-4"
      >
        {mutation.isError && <ErrorBanner message={getApiErrorMessage(mutation.error, "Upload failed.")} />}

        <Field label="File" htmlFor="file">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border bg-paper px-4 py-6 text-center hover:border-brass"
          >
            <UploadCloud size={22} className="text-ink-faint" />
            <span className="text-sm text-ink-muted">
              {file ? file.name : "Click to choose a PDF, DOCX, TXT, or MD file"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>

        <Field label="Visibility" htmlFor="visibility" hint="Restricted documents need explicit access grants.">
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as DocumentVisibility)}
            className={inputClass}
          >
            <option value="RESTRICTED">Restricted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </Field>

        {mutation.isPending && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-brass transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!file} loading={mutation.isPending}>
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function DocumentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [fileType, setFileType] = useState("");
  const [status, setStatus] = useState<ProcessingStatus | "">("");
  const [showUpload, setShowUpload] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Document | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents", page, fileType, status],
    queryFn: () =>
      listDocuments({
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        file_type: fileType || undefined,
        status: status || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      notify("Document deleted.", "success");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setPendingDelete(null);
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't delete this document."), "error"),
  });

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={fileType}
            onChange={(e) => {
              setFileType(e.target.value);
              setPage(0);
            }}
            className={`${inputClass} w-auto`}
          >
            <option value="">All file types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProcessingStatus | "");
              setPage(0);
            }}
            className={`${inputClass} w-auto`}
          >
            <option value="">All statuses</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <RoleGate roles={["ADMIN", "MANAGER"]}>
          <Button onClick={() => setShowUpload(true)}>
            <Plus size={15} /> Upload document
          </Button>
        </RoleGate>
      </div>

      {isLoading && <Spinner label="Loading documents…" />}
      {error && <ErrorBanner message={getApiErrorMessage(error, "Couldn't load documents.")} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={FileStack}
          title="No documents match these filters"
          description="Try clearing the filters, or upload the first document to your knowledge base."
        />
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-paper/60 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((doc) => (
                <tr key={doc.id} className="hover:bg-paper/40">
                  <td className="max-w-xs truncate px-5 py-3">
                    <Link to={`/documents/${doc.id}`} className="font-medium text-ink hover:text-brass-dark">
                      {doc.original_filename}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(doc.processing_status)}>{titleCase(doc.processing_status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(doc.visibility)}>{titleCase(doc.visibility)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Download"
                        onClick={() => downloadDocument(doc.id, doc.original_filename)}
                        className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                      >
                        <Download size={15} />
                      </button>
                      {canManage && (
                        <button
                          title="Delete"
                          onClick={() => setPendingDelete(doc)}
                          className="rounded p-1.5 text-ink-faint hover:bg-signal-danger/10 hover:text-signal-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
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
            <Button
              variant="secondary"
              size="sm"
              disabled={data.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      {pendingDelete && (
        <Modal title="Delete document" onClose={() => setPendingDelete(null)}>
          <p className="text-sm text-ink-muted">
            Delete <span className="font-medium text-ink">{pendingDelete.original_filename}</span>? This removes it
            and its chunks permanently.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(pendingDelete.id)}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
