import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const TITLES: Array<[RegExp, string]> = [
  [/^\/$/, "Dashboard"],
  [/^\/documents$/, "Documents"],
  [/^\/documents\/[^/]+$/, "Document"],
  [/^\/search$/, "Search"],
  [/^\/chat/, "Ask EnterpriseIQ"],
  [/^\/admin\/audit-logs$/, "Audit log"],
  [/^\/admin$/, "Org stats"],
  [/^\/users$/, "People"],
];

function titleFor(pathname: string): string {
  const match = TITLES.find(([re]) => re.test(pathname));
  return match ? match[1] : "EnterpriseIQ";
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={titleFor(location.pathname)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
