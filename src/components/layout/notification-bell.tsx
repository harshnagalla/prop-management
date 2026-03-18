"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Notification {
  type: "overdue_bill" | "no_income" | "vacant" | "no_documents";
  title: string;
  message: string;
  propertyId?: string;
  severity: "warning" | "info";
}

function getNotificationLink(n: Notification): string {
  switch (n.type) {
    case "overdue_bill":
      return "/bills";
    case "no_income":
      return n.propertyId ? `/income` : "/income";
    case "vacant":
      return n.propertyId ? `/properties/${n.propertyId}` : "/properties";
    case "no_documents":
      return n.propertyId ? `/documents` : "/documents";
    default:
      return "/dashboard";
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const count = notifications.length;
  const hasWarnings = notifications.some((n) => n.severity === "warning");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          open && "bg-muted text-foreground"
        )}
      >
        <Bell size={18} />
        <span>Notifications</span>
        {count > 0 && (
          <span
            className={cn(
              "ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold text-white",
              hasWarnings ? "bg-destructive" : "bg-primary"
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-[var(--radius)] shadow-lg max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alerts ({count})
            </span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          {count === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.slice(0, 20).map((n, i) => (
                <a
                  key={i}
                  href={getNotificationLink(n)}
                  className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {n.severity === "warning" ? (
                    <AlertTriangle size={15} className="text-warning mt-0.5 shrink-0" />
                  ) : (
                    <Info size={15} className="text-primary mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
