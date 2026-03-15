"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Ruler,
} from "lucide-react";
import { formatCurrency, formatPercent, formatDate, calcRentalYield } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "occupied":
      return "success" as const;
    case "vacant":
      return "secondary" as const;
    case "under_renovation":
      return "warning" as const;
    case "for_sale":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pt-12 md:pt-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-[var(--radius)] p-5 space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-6 w-28 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-32 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/properties/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error("Failed to load property");
        }
        const data = await res.json();
        setProperty(data);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (notFound || !property) {
    return (
      <div className="pt-12 md:pt-0">
        <EmptyState
          icon={Building2}
          title="Property not found"
          description="The property you're looking for doesn't exist or you don't have access to it."
          action={
            <Button asChild variant="default">
              <Link href="/properties">Back to Properties</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const yld = calcRentalYield(property.monthlyRent, property.currentValue);

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties" className="gap-2">
            <ArrowLeft size={16} />
            Back to Properties
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{property.name}</h1>
          <Badge variant={getStatusBadgeVariant(property.status || "vacant")}>
            {property.status?.replace("_", " ")}
          </Badge>
          {property.type && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {property.type}
            </Badge>
          )}
        </div>
        {(property.address || property.city) && (
          <p className="text-sm text-muted-foreground">
            {property.address}
            {property.city ? `, ${property.city}` : ""}
          </p>
        )}
      </div>

      {/* Overview stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Value</p>
            <p className="text-lg font-semibold mt-1">{formatCurrency(property.currentValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Purchase Price</p>
            <p className="text-lg font-semibold mt-1">{formatCurrency(property.purchasePrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Rent</p>
            <p className="text-lg font-semibold mt-1">
              {property.monthlyRent ? formatCurrency(property.monthlyRent) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rental Yield</p>
            <p
              className={cn(
                "text-lg font-semibold mt-1",
                yld > 5 ? "text-success" : yld > 3 ? "text-foreground" : "text-warning"
              )}
            >
              {yld > 0 ? formatPercent(yld) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {property.area && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler size={14} />
            <span>
              {property.area} {property.areaUnit || "sqft"}
            </span>
          </div>
        )}
        {property.tenantName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={14} />
            <span>Tenant: {property.tenantName}</span>
          </div>
        )}
        {property.purchaseDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>Purchased: {formatDate(property.purchaseDate)}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {property.notes && (
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{property.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
