import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, ScrollText, Users, BarChart3, Utensils,
  Building2, Settings, UserCog, LogOut, ChevronDown, ChevronRight, Menu, X,
  ChevronLeft, MoreHorizontal
} from "lucide-react";
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggle = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const Sidebar = (
    <aside className={cn(
      "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border select-none",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header with logo */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-white px-4 py-5 h-20">
        <div className={cn("flex items-center w-full transition-all duration-300", isCollapsed ? "justify-center" : "justify-start pl-2")}>
          <img 
            src="/logo1.png" 
            alt="Crescent IST" 
            className={cn("transition-all duration-300 object-contain", isCollapsed ? "h-10 w-10" : "h-14")} 
          />
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.to && location.pathname === item.to;
          
          if (item.children) {
            const isOpen = openGroups[item.label];
            const hasActiveChild = item.children.some(c => location.pathname === c.to);
            
            return (
              <div key={item.label} className="space-y-1">
                <button
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                      localStorage.setItem("sidebar-collapsed", "false");
                      setOpenGroups((s) => ({ ...s, [item.label]: true }));
                    } else {
                      toggle(item.label);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/90 transition-all duration-200 hover:bg-sidebar-border/40",
                    isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2.5",
                    hasActiveChild && "bg-sidebar-border/20 text-white"
                  )}
                >
                  <span className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-3")}>
                    <Icon size={18} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </span>
                  {!isCollapsed && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>
                {isOpen && !isCollapsed && (
                  <div className="mt-1 space-y-1 pl-10 transition-all duration-300">
                    {item.children.map((c) => {
                      const childActive = location.pathname === c.to;
                      return (
                        <Link
                          key={c.to}
                          to={c.to}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-all duration-150",
                            childActive 
                              ? "text-white font-semibold bg-sidebar-primary/50" 
                              : "text-sidebar-foreground/75 hover:bg-sidebar-border/40 hover:text-white"
                          )}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={item.to}
              to={item.to!}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm animate-pulse-once"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-border/40",
              )}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer / Logout and Collapse Toggle */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button 
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/90 hover:bg-sidebar-border/40 transition-all duration-200",
            isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
        
        {/* Collapse Sidebar Button for Desktop */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className={cn(
            "hidden lg:flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-white transition-all duration-200",
            isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
          )}
        >
          <ChevronLeft className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} size={18} />
          {!isCollapsed && <span>Collapse Menu</span>}
        </button>

        {!isCollapsed && (
          <div className="px-3 text-[10px] text-sidebar-foreground/50 transition-all duration-300">
            © 2025 Crescent IST<br />All rights reserved.
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">{Sidebar}</div>

      <main className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Display small brand logo on mobile header instead of hamburger */}
            <img src="/logo1.png" alt="Crescent IST" className="h-8 w-8 object-contain lg:hidden" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
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
        
        <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground mb-4 lg:mb-0">
          Crescent Institute of Science &amp; Technology, GST Road, Vandalur, Chennai - 600 048
        </footer>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around lg:hidden pb-safe">
        {[
          { label: "Home", icon: LayoutDashboard, to: "/" },
          { label: "Summary", icon: ClipboardList, to: "/summary" },
          { label: "Attendance", icon: ScrollText, to: "/attendance" },
          { label: "Students", icon: Users, to: "/students" },
        ].map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setShowMoreMenu(false)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-all duration-200",
                active ? "text-sidebar-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-200", active && "scale-110")} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Tab */}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-all duration-200",
            showMoreMenu ? "text-sidebar-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {showMoreMenu ? <X size={20} /> : <MoreHorizontal size={20} />}
          <span className="mt-0.5">{showMoreMenu ? "Close" : "More"}</span>
        </button>
      </div>

      {/* Mobile More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 lg:hidden">
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setShowMoreMenu(false)} />
          
          {/* Sliding container */}
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-background p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img src="/logo1.png" alt="Crescent IST" className="h-8 object-contain" />
                <h3 className="text-lg font-bold text-foreground">More Menu</h3>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)} 
                className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pb-8">
              {/* Reports Section */}
              <div className="col-span-2 border border-border rounded-xl p-3 bg-muted/20">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BarChart3 size={14} /> Reports
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/reports/daily"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-background border border-border py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-white"
                  >
                    Daily Report
                  </Link>
                  <Link
                    to="/reports/weekly"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-background border border-border py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-white"
                  >
                    Weekly Report
                  </Link>
                </div>
              </div>

              {/* Hostel Section */}
              <div className="col-span-2 border border-border rounded-xl p-3 bg-muted/20">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 size={14} /> Hostel
                </h4>
                <Link
                  to="/hostel/female"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-background border border-border py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-white"
                >
                  Female Hostel
                </Link>
              </div>

              {/* Other Items */}
              <Link
                to="/sessions"
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center text-sm font-medium text-foreground hover:bg-accent hover:text-white"
              >
                <Utensils size={20} className="text-sidebar-primary" />
                <span>Meal Sessions</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center text-sm font-medium text-foreground hover:bg-accent hover:text-white"
              >
                <Settings size={20} className="text-sidebar-primary" />
                <span>Settings</span>
              </Link>
              
              <Link
                to="/users"
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center text-sm font-medium text-foreground hover:bg-accent hover:text-white"
              >
                <UserCog size={20} className="text-sidebar-primary" />
                <span>Users</span>
              </Link>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

