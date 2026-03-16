import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

const variantStyles = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60",
    icon: "bg-blue-600/10 text-blue-700",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60",
    icon: "bg-emerald-600/10 text-emerald-700",
  },
  purple: {
    bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/60",
    icon: "bg-violet-600/10 text-violet-700",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60",
    icon: "bg-amber-600/10 text-amber-700",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200/60",
    icon: "bg-rose-600/10 text-rose-700",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200/60",
    icon: "bg-slate-600/10 text-slate-700",
  },
  default: {
    bg: "",
    icon: "bg-primary/10 text-primary",
  },
} as const;

type StatCardVariant = keyof typeof variantStyles;

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: StatCardVariant;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(styles.bg, className)}>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              styles.icon
            )}
          >
            <Icon size={18} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                {trend.positive ? "\u2191" : "\u2193"} {trend.value}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
