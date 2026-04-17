import React from "react";
import { Link, useLocation } from "wouter";
import { ShieldAlert, LayoutDashboard, Activity, FileBarChart, Terminal, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/classify", label: "Live Classifier", icon: Activity },
    { href: "/results", label: "Model Results", icon: FileBarChart },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-mono">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary">
            <ShieldAlert size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-tight">IDS-SEC</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Command Center</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground mb-4 mt-2 px-2 uppercase tracking-wider">Dashboards</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium border border-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal size={14} />
            <span>SYS_READY // V0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden flex flex-col w-full h-full">
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" />
            <span className="font-bold text-sm">IDS-SEC</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={20} />
          </Button>
        </header>

        {isMobileMenuOpen && (
          <nav className="p-4 space-y-1 bg-card border-b border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Desktop Main Content */}
      <main className="hidden md:block flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
