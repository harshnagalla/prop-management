import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon size={18} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs mt-1 font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "\u2191" : "\u2193"} {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
