import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileStack,
  Search,
  MessagesSquare,
  ShieldCheck,
  ScrollText,
  Users,
  Vault,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { to: "/documents", label: "Documents", icon: FileStack, roles: null },
  { to: "/search", label: "Search", icon: Search, roles: null },
  { to: "/chat", label: "Ask EnterpriseIQ", icon: MessagesSquare, roles: null },
  { to: "/admin", label: "Org stats", icon: ShieldCheck, roles: ["ADMIN"] },
  { to: "/admin/audit-logs", label: "Audit log", icon: ScrollText, roles: ["ADMIN"] },
  { to: "/users", label: "People", icon: Users, roles: ["ADMIN"] },
] as const;

export function Sidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy-950 text-white/90">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brass/90 text-navy-950">
          <Vault size={18} strokeWidth={2.25} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-white">EnterpriseIQ</p>
          <p className="mt-1 text-[11px] leading-none text-white/40">Knowledge, governed</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.filter((item) => !item.roles || hasRole(...item.roles)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )
            }
          >
            <item.icon size={16} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-white/35">
        Access is enforced at the database layer, not just this menu.
      </div>
    </aside>
  );
}
