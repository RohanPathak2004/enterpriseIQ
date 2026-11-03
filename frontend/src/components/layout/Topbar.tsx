import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge, statusTone } from "@/components/ui/Badge";
import { initials } from "@/utils/format";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-paper"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
            {initials(user.name)}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-none text-ink">{user.name}</p>
            <p className="mt-1 text-xs leading-none text-ink-faint">{user.email}</p>
          </div>
          <Badge tone={statusTone(user.role)}>{user.role}</Badge>
          <ChevronDown size={14} className="text-ink-faint" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-border bg-white py-1 shadow-panel">
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
