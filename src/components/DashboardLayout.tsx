import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  LayoutDashboard, ScrollText, Users, LogOut, ChevronLeft, UserCog, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; icon: any; to: string };

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "dashboard" },
  { label: "Attendance Log", icon: ScrollText, to: "attendance" },
  { label: "Students", icon: Users, to: "students" },
];

export function DashboardLayout({
  title,
  subtitle,
  children,
  activeTab,
  onTabChange,
}: { 
  title: string; 
  subtitle?: string; 
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

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
      {/* Header with logo and collapse button at the top */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-white px-4 py-4 h-20">
        <div className={cn("flex items-center w-full transition-all duration-300", isCollapsed ? "justify-center" : "justify-between pl-2")}>
          {isCollapsed ? (
            <button 
              onClick={toggleCollapse} 
              title="Expand Sidebar" 
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            >
              <img src="/logo1.png" alt="Crescent IST" className="h-8 w-8 object-contain" />
            </button>
          ) : (
            <>
              <img 
                src="/logo1.png" 
                alt="Crescent IST" 
                className="h-12 object-contain" 
              />
              <button
                onClick={toggleCollapse}
                title="Collapse Sidebar"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.to;
          
          return (
            <button
              key={item.to}
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  localStorage.setItem("sidebar-collapsed", "false");
                }
                if (onTabChange) onTabChange(item.to);
              }}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex w-full items-center rounded-md text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-border/40",
              )}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      {/* Footer / Logout */}
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

        {!isCollapsed && (
          <div className="px-3 text-[10px] text-sidebar-foreground/50 transition-all duration-300">
            © 2026 Crescent IST<br />All rights reserved.
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
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around lg:hidden pb-safe">
        {[
          { label: "Home", icon: LayoutDashboard, to: "dashboard" },
          { label: "Attendance", icon: ScrollText, to: "attendance" },
          { label: "Students", icon: Users, to: "students" },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.to;
          return (
            <button
              key={item.to}
              onClick={() => {
                if (onTabChange) onTabChange(item.to);
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-all duration-200",
                active ? "text-sidebar-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-200", active && "scale-110")} />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
