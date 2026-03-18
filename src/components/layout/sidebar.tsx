"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  IndianRupee,
  Wallet,
  FileText,
  Upload,
  LogOut,
  Menu,
  X,
  Map,
  Users,
  ArrowLeftRight,
  Landmark,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/properties", label: "Properties", icon: Building2 },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/bills", label: "Bills", icon: Receipt },
      { href: "/income", label: "Rental Income", icon: IndianRupee },
      { href: "/rent-tracker", label: "Rent Tracker", icon: Wallet },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/map", label: "Map View", icon: Map },
      { href: "/tenants", label: "Tenants", icon: Users },
      { href: "/compare", label: "Compare", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Import",
    items: [
      { href: "/import", label: "AI Import", icon: Upload },
      { href: "/bank-import", label: "Bank Import", icon: Landmark },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 md:hidden h-11 w-11 min-h-[44px] min-w-[44px]"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 shadow-[var(--shadow-card)]",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="text-primary" size={24} />
            BhoomiQ
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-colors min-h-[44px]",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || session?.user?.email || "User"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
              className="h-8 w-8"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
