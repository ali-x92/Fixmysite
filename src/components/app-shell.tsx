import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  Sparkles,
  FileBarChart2,
  Wrench,
  History,
  Settings,
  Search,
  ChevronDown,
  User,
  LogOut,
  Command,
  X,
  FileText,
  Bell,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { signOut } from "@/features/auth/auth-client";
import { useAuthSession } from "@/features/auth/use-auth-session";
import { getHistory } from "@/lib/api-client";
import type { HistoryResponse } from "@/features/history/contracts";

const nav: {
  label: string;
  to: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
  badge?: string;
}[] = [
  { label: "Dashboard", to: "/", icon: LayoutGrid, exact: true },
  { label: "Analyze", to: "/analyze", icon: Sparkles },
  { label: "Reports", to: "/reports", icon: FileBarChart2 },
  { label: "AI Fixes", to: "/fixes", icon: Wrench },
  { label: "History", to: "/history", icon: History },
  { label: "Settings", to: "/settings", icon: Settings },
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUR = "360ms";
const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 64;

function Logo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex h-11 w-full items-center gap-2.5 rounded-xl px-1.5 transition-colors hover:bg-surface overflow-hidden"
    >
      <BrandMark size={36} />
      <div
        className="min-w-0 text-left whitespace-nowrap"
        style={{
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "translateX(-8px)" : "translateX(0)",
          transition: `opacity ${collapsed ? "140ms" : "260ms"} ease ${collapsed ? "0ms" : "120ms"}, transform ${DUR} ${EASE}`,
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <div className="text-heading text-[14px] font-semibold leading-tight">FixMySite AI</div>
        <div className="text-[10.5px] font-medium text-muted-foreground leading-tight">
          AI Audit Platform
        </div>
      </div>
    </button>
  );
}

function SidebarNav({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className="hidden md:flex md:shrink-0 flex-col border-r border-border bg-background overflow-hidden"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        transition: `width ${DUR} ${EASE}`,
        willChange: "width",
      }}
    >
      <div className="h-16 flex items-center border-b border-border px-2.5 shrink-0">
        <Logo collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar p-2.5">
        <div
          className="px-2 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground overflow-hidden whitespace-nowrap"
          style={{
            height: collapsed ? 0 : 20,
            opacity: collapsed ? 0 : 1,
            transition: `opacity ${collapsed ? "120ms" : "240ms"} ease ${collapsed ? "0ms" : "120ms"}, height ${DUR} ${EASE}`,
          }}
        >
          Workspace
        </div>

        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              title={item.label}
              onClick={() => {
                if (collapsed) setCollapsed(false);
              }}
              className={cn(
                "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium overflow-hidden",
                "transition-colors duration-200",
                active
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span
                className="truncate whitespace-nowrap flex-1"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transform: collapsed ? "translateX(-6px)" : "translateX(0)",
                  transition: `opacity ${collapsed ? "120ms" : "260ms"} ease ${collapsed ? "0ms" : "140ms"}, transform ${DUR} ${EASE}`,
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap"
                  style={{
                    opacity: collapsed ? 0 : 1,
                    transition: `opacity ${collapsed ? "100ms" : "260ms"} ease ${collapsed ? "0ms" : "160ms"}`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Topbar({
  onOpenSearch,
  onOpenNotifications,
  email,
}: {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  email?: string;
}) {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await signOut();
    } catch {
      // Session cleanup is best-effort before redirecting.
    }
    navigate({ to: "/login" });
  };
  const displayName = email?.split("@")[0] ?? "Account";
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        <button type="button" onClick={onOpenSearch} className="relative flex-1 max-w-lg text-left">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="flex h-10 w-full items-center rounded-xl border border-border bg-surface pl-9 pr-14 text-sm text-muted-foreground transition-shadow hover:border-primary/30 hover:bg-card hover:shadow-soft">
            Search reports, issues, URLs...
          </span>
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Open notifications"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-surface">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-semibold text-heading">{displayName}</div>
                <div className="text-xs text-muted-foreground">{email ?? ""}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-danger focus:text-danger">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- Panels --------------------------------- */

function SidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-background shadow-pop animate-slide-in-right flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <h2 className="text-heading text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
      </aside>
    </div>
  );
}

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<HistoryResponse["entries"]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getHistory()
      .then(({ entries: nextEntries }) => setEntries(nextEntries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open]);

  const normalizedQuery = q.trim().toLowerCase();
  const matchingEntries = entries.filter(({ site }) =>
    `${site.domain} ${site.url}`.toLowerCase().includes(normalizedQuery),
  );
  const quickActions = [
    { label: "New scan", to: "/analyze" },
    { label: "View reports", to: "/reports" },
    { label: "AI fixes", to: "/fixes" },
  ] as const;

  const openRoute = (to: "/analyze" | "/reports" | "/fixes") => {
    onClose();
    navigate({ to });
  };
  return (
    <SidePanel open={open} onClose={onClose} title="Search">
      <div className="p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reports and website URLs..."
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/30 focus:bg-card focus:shadow-soft focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="mt-6">
          <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {q ? "Matching reports" : "Recent reports"}
          </div>
          <div className="space-y-1">
            {matchingEntries.slice(0, 8).map(({ analysis, site }) => (
              <button
                key={analysis.id}
                onClick={() => {
                  onClose();
                  navigate({ to: "/reports/$id", params: { id: analysis.id } });
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/5"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-heading">{site.domain}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Report · {analysis.status} ·{" "}
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
            {!loading && matchingEntries.length === 0 && (
              <p className="rounded-xl bg-surface px-3 py-4 text-sm text-muted-foreground">
                {q ? "No saved reports match that search." : "No saved reports yet."}
              </p>
            )}
            {loading && (
              <p className="px-3 py-4 text-sm text-muted-foreground">Loading reports...</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.to}
                onClick={() => openRoute(action.to)}
                className="group rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-heading transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-soft hover:-translate-y-0.5"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SidePanel>
  );
}

function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryResponse["entries"]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getHistory()
      .then(({ entries: nextEntries }) => setEntries(nextEntries.slice(0, 6)))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <SidePanel open={open} onClose={onClose} title="Notifications">
      <div className="p-5">
        {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
        {!loading && entries.length === 0 && (
          <div className="py-8 text-center">
            <Bell className="mx-auto h-5 w-5 text-primary" />
            <h3 className="mt-3 text-sm font-semibold text-heading">You are all caught up</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Completed analyses will appear here.
            </p>
          </div>
        )}
        <div className="space-y-2">
          {entries.map(({ analysis, site }) => (
            <button
              key={analysis.id}
              onClick={() => {
                onClose();
                navigate({ to: "/reports/$id", params: { id: analysis.id } });
              }}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileBarChart2 className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-heading">
                  Analysis {analysis.status}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {site.domain} · {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </SidePanel>
  );
}

/* --------------------------------- Shell ---------------------------------- */

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { session, ready } = useAuthSession();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/login" });
  }, [navigate, ready, session]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready || !session) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarNav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          email={session.user.email}
        />
        <main className="flex-1">{children}</main>
      </div>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-heading mt-3 text-3xl font-semibold leading-[1.1] sm:text-[36px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
