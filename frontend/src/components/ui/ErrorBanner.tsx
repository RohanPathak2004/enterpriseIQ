import { AlertTriangle } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-signal-danger/25 bg-signal-danger/5 px-4 py-3 text-sm text-signal-danger">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
