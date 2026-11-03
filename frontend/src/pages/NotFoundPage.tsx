import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-panel">
        <Compass size={22} className="text-ink-faint" />
      </div>
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-1 text-sm text-ink-muted">That page doesn't exist, or you don't have access to it.</p>
      </div>
      <Link to="/">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
