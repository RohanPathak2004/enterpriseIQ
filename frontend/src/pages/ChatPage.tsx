import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { MessagesSquare, Plus, SendHorizontal, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { deleteConversation, getConversation, listConversations, sendMessage } from "@/api/chat";
import type { ChatSource, Message, MessageSource } from "@/types";
import { getApiErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/utils/format";

function SourceList({ sources }: { sources: (ChatSource | MessageSource)[] }) {
  const [open, setOpen] = useState(false);
  const valid = sources.filter((s) => s.document_name);
  if (valid.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {valid.length} source{valid.length === 1 ? "" : "s"}
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {valid.map((s, i) => (
            <li key={i} className="rounded-md border border-border bg-paper px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 font-medium text-ink">
                  <FileText size={11} /> {s.document_name}
                  {s.page != null && <span className="font-normal text-ink-faint"> · p.{s.page}</span>}
                </span>
                <span className="font-mono text-ink-faint">{(s.relevance_score * 100).toFixed(0)}%</span>
              </div>
              {s.excerpt && <p className="mt-1 text-ink-muted">{s.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message | { role: "user" | "assistant"; content: string; sources?: ChatSource[] } }) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser ? "bg-navy-900 text-white" : "border border-border bg-white text-ink"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && "sources" in message && message.sources && <SourceList sources={message.sources} />}
      </div>
    </div>
  );
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ role: "user" | "assistant"; content: string; sources?: ChatSource[] }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({ queryKey: ["conversations"], queryFn: () => listConversations() });

  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId as string),
    enabled: !!conversationId,
  });

  useEffect(() => {
    setLocalMessages([]);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, localMessages.length]);

  const sendMutation = useMutation({
    mutationFn: (question: string) => sendMessage(question, conversationId),
    onSuccess: (res) => {
      setLocalMessages((prev) => [...prev, { role: "assistant", content: res.answer, sources: res.sources }]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (!conversationId) {
        navigate(`/chat/${res.conversation_id}`, { replace: true });
      } else {
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      }
    },
    onError: (err) => {
      notify(getApiErrorMessage(err, "Couldn't get an answer."), "error");
      setLocalMessages((prev) => prev.slice(0, -1));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_data, id) => {
      notify("Conversation deleted.", "success");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (id === conversationId) navigate("/chat");
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't delete this conversation."), "error"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = draft.trim();
    if (!question || sendMutation.isPending) return;
    setLocalMessages((prev) => [...prev, { role: "user", content: question }]);
    setDraft("");
    sendMutation.mutate(question);
  }

  // When we're mid-conversation (server has it), don't show the just-sent user
  // question twice: server history already reflects the previous turn, and
  // localMessages holds only what hasn't round-tripped yet in this render.
  const serverMessages = conversation?.messages ?? [];
  const combined: Array<Message | { role: "user" | "assistant"; content: string; sources?: ChatSource[] }> = [
    ...serverMessages,
    ...localMessages,
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-6 -my-6">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border p-3">
          <Button className="w-full" variant="secondary" onClick={() => navigate("/chat")}>
            <Plus size={15} /> New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {(conversations ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-ink-faint">No conversations yet.</p>
          )}
          <ul>
            {(conversations ?? []).map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className={clsx(
                    "group flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-paper",
                    c.id === conversationId && "bg-paper"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{c.title ?? "Untitled conversation"}</p>
                    <p className="text-xs text-ink-faint">{formatRelativeTime(c.updated_at)}</p>
                  </div>
                  <Trash2
                    size={13}
                    className="shrink-0 text-ink-faint opacity-0 hover:text-signal-danger group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(c.id);
                    }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          {loadingConversation ? (
            <Spinner label="Loading conversation…" />
          ) : combined.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="Ask anything about your organization's documents"
              description="Answers are grounded in retrieved passages and cite exactly where they came from — no source, no guess."
            />
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {combined.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {sendMutation.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink-faint shadow-sm">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border bg-white px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question about your documents…"
              className="flex-1 rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/40"
            />
            <Button type="submit" disabled={!draft.trim()} loading={sendMutation.isPending}>
              <SendHorizontal size={15} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
