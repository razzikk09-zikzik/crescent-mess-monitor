import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, ScrollText, Users, BarChart3, Utensils,
  Building2, Settings, UserCog, LogOut, ChevronDown, ChevronRight, Menu, X,
} from "lucide-react";
import logo from "@/assets/crescent-logo.png.asset.json";
import { cn } from "@/lib/utils";

type NavItem = { label: string; icon: any; to?: string; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Today's Summary", icon: ClipboardList, to: "/summary" },
  { label: "Attendance Log", icon: ScrollText, to: "/attendance" },
  { label: "Students", icon: Users, to: "/students" },
  {
    label: "Reports", icon: BarChart3, children: [
      { label: "Daily Report", to: "/reports/daily" },
      { label: "Weekly Report", to: "/reports/weekly" },
    ],
  },
  { label: "Meal Sessions", icon: Utensils, to: "/sessions" },
  {
    label: "Hostel", icon: Building2, children: [
      { label: "Female Hostel", to: "/hostel/female" },
    ],
  },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Users", icon: UserCog, to: "/users" },
];

export function DashboardLayout({
  title,
  subtitle,
  children,
}: { title: string; subtitle?: string; children: ReactNode }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

  const Sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-center border-b border-sidebar-border bg-white px-4 py-5">
        <img src={logo.url} alt="Crescent IST" className="h-14 object-contain" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.to && location.pathname === item.to;
          if (item.children) {
            const isOpen = openGroups[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition hover:bg-sidebar-border/40"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" size={18} />
                    {item.label}
                  </span>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-1 pl-10">
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className="block rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-border/40 hover:text-white"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to!}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-border/40",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 hover:bg-sidebar-border/40">
          <LogOut size={18} /> Logout
        </button>
        <div className="mt-4 px-3 text-xs text-sidebar-foreground/60">
          © 2025 Crescent IST<br />All rights reserved.
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative">{Sidebar}</div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 hover:bg-muted lg:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground sm:grid">
              <UserCog size={18} />
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-foreground">Admin</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
            <ChevronDown size={16} className="hidden text-muted-foreground sm:block" />
          </div>
        </header>
        <div className="flex-1 px-6 py-6 lg:px-8">{children}</div>
        <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
          Crescent Institute of Science &amp; Technology, GST Road, Vandalur, Chennai - 600 048
        </footer>
      </main>
    </div>
  );
}
