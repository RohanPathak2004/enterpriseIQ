import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { search as searchRequest } from "@/api/search";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fileType, setFileType] = useState("");
  const [threshold, setThreshold] = useState(0.75);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (q: string) =>
      searchRequest(q, {
        file_type: fileType || undefined,
        similarity_threshold: threshold,
      }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
    mutation.mutate(query.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Semantic search</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Search across every document you have access to, ranked by meaning rather than keyword matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-4 shadow-panel">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What is our policy on remote work stipends?"
              className={`${inputClass} pl-9`}
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={15} /> Filters
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Search
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <Field label="File type" htmlFor="fileType">
              <select id="fileType" value={fileType} onChange={(e) => setFileType(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
                <option value="md">Markdown</option>
              </select>
            </Field>
            <Field label={`Minimum relevance (${threshold.toFixed(2)})`} htmlFor="threshold">
              <input
                id="threshold"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-brass"
              />
            </Field>
          </div>
        )}
      </form>

      {mutation.isPending && <Spinner label="Searching your knowledge base…" />}
      {mutation.isError && <ErrorBanner message={getApiErrorMessage(mutation.error, "Search failed.")} />}

      {mutation.data && mutation.data.results.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="No matching results"
          description="Try a broader question, or lower the minimum relevance filter."
        />
      )}

      {mutation.data && mutation.data.results.length > 0 && (
        <ul className="space-y-3">
          {mutation.data.results.map((r) => (
            <li key={r.chunk_id} className="rounded-lg border border-border bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <Link to={`/documents/${r.document_id}`} className="font-medium text-ink hover:text-brass-dark">
                  {r.document_name}
                </Link>
                <span className="shrink-0 rounded bg-paper px-2 py-0.5 font-mono text-xs text-ink-muted">
                  {(r.relevance_score * 100).toFixed(0)}% match
                </span>
              </div>
              {(r.page_number != null || r.section_title) && (
                <p className="mt-1 text-xs text-ink-faint">
                  {r.section_title && <span>{r.section_title}</span>}
                  {r.section_title && r.page_number != null && " · "}
                  {r.page_number != null && <span>Page {r.page_number}</span>}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      {!submitted && !mutation.data && (
        <EmptyState
          icon={SearchIcon}
          title="Search your organization's knowledge"
          description="Results are filtered to documents you're allowed to see — enforced by the database, not the UI."
        />
      )}
    </div>
  );
}
