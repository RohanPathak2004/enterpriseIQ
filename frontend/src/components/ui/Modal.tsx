import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  width = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/40 px-4" onClick={onClose}>
      <div
        className={`w-full ${width} rounded-lg border border-border bg-white shadow-panel`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-paper hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
