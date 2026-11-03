import type { LabelHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  ...props
}: { label: string; htmlFor: string; hint?: string; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink" {...props}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/40";
