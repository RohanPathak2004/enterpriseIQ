import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brass";

const TONES: Record<Tone, string> = {
  neutral: "bg-paper text-ink-muted border-border",
  success: "bg-signal-success/10 text-signal-success border-signal-success/25",
  warning: "bg-brass/10 text-brass-dark border-brass/25",
  danger: "bg-signal-danger/10 text-signal-danger border-signal-danger/25",
  info: "bg-signal-info/10 text-signal-info border-signal-info/25",
  brass: "bg-brass/10 text-brass-dark border-brass/25",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium",
        TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
    case "UPLOADED":
      return "info";
    case "FAILED":
      return "danger";
    case "PUBLIC":
      return "success";
    case "RESTRICTED":
      return "brass";
    case "ADMIN":
      return "brass";
    case "MANAGER":
      return "info";
    case "EMPLOYEE":
      return "neutral";
    default:
      return "neutral";
  }
}
