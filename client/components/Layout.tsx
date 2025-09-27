import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Settings, Home, Menu, X, Users } from "lucide-react";
import AuthButtons from "./AuthButtons";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "PVP", href: "/pvp", icon: Users },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-border bg-card/40 backdrop-blur-sm min-h-screen sticky top-0">
            <div className="h-16 px-4 flex items-center justify-between border-b border-border">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-foreground"
              >
                <Brain className="h-7 w-7 text-primary" />
                MemoryMaster
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Collapse sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-2",
                        isActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Sidebar open button (desktop) */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex fixed top-3 left-3 z-50"
              aria-label="Expand sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {/* Top bar (mobile + content header) */}
          <header className="md:hidden border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-4 h-16 flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-foreground"
              >
                <Brain className="h-7 w-7 text-primary" />
                MM
              </Link>
              <div className="flex items-center gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          isActive && "bg-primary text-primary-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
                <AuthButtons />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 md:px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
