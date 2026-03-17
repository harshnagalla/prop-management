"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Building2, RefreshCw, IndianRupee, Maximize2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/utils/toast";
import type { Property } from "@/lib/db/schema";

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

function getStatusColor(status: string) {
  switch (status) {
    case "occupied": return "bg-emerald-500";
    case "vacant": return "bg-slate-400";
    case "under_renovation": return "bg-amber-500";
    case "for_sale": return "bg-blue-500";
    case "sold": return "bg-red-500";
    default: return "bg-slate-400";
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "occupied": return "success" as const;
    case "vacant": return "secondary" as const;
    case "under_renovation": return "warning" as const;
    case "for_sale": return "outline" as const;
    case "sold": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [customIcon, setCustomIcon] = useState<unknown>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    // Load Leaflet CSS and create custom icon
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(59,130,246,0.4);border:2px solid white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
      setCustomIcon(icon);
      setLeafletReady(true);
    });

    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then(setProperties)
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  }, []);

  const geocodeAll = async () => {
    setGeocoding(true);
    try {
      const res = await fetch("/api/properties/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      toast.success(`Geocoded ${data.geocoded} of ${data.total} properties`);
      // Reload properties
      const updated = await fetch("/api/properties").then((r) => r.json());
      setProperties(updated);
    } catch {
      toast.error("Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  };

  const mapped = properties.filter((p) => p.latitude && p.longitude);
  const unmapped = properties.filter((p) => !p.latitude || !p.longitude);

  // Center on Ahmedabad by default, or center of mapped properties
  const center: [number, number] = mapped.length > 0
    ? [
        mapped.reduce((s, p) => s + parseFloat(p.latitude || "0"), 0) / mapped.length,
        mapped.reduce((s, p) => s + parseFloat(p.longitude || "0"), 0) / mapped.length,
      ]
    : [23.0225, 72.5714]; // Ahmedabad

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-36 bg-muted rounded" />
          <div className="h-10 w-40 bg-muted rounded" />
        </div>
        <div className="h-[500px] bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Map</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mapped.length} of {properties.length} properties on map
            {unmapped.length > 0 && ` · ${unmapped.length} need geocoding`}
          </p>
        </div>
        {unmapped.length > 0 && (
          <Button onClick={geocodeAll} disabled={geocoding} className="gap-2">
            <RefreshCw size={16} className={geocoding ? "animate-spin" : ""} />
            {geocoding ? "Locating..." : `Locate ${unmapped.length} Properties`}
          </Button>
        )}
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="h-[500px] md:h-[600px] relative">
          {leafletReady && customIcon ? (
            <MapContainer
              center={center}
              zoom={12}
              className="h-full w-full z-0"
              ref={mapRef as any}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapped.map((p) => (
                <Marker
                  key={p.id}
                  position={[parseFloat(p.latitude!), parseFloat(p.longitude!)]}
                  icon={customIcon as any}
                >
                  <Popup>
                    <div className="min-w-[200px] p-1">
                      <Link href={`/properties/${p.id}`} className="text-sm font-bold text-blue-600 hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{p.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(p.status)}`} />
                        <span className="text-xs capitalize">{p.status?.replace("_", " ")}</span>
                      </div>
                      {p.currentValue && (
                        <p className="text-xs font-semibold mt-1">{formatCurrency(p.currentValue)}</p>
                      )}
                      {p.monthlyRent && (
                        <p className="text-xs text-slate-500">{formatCurrency(p.monthlyRent)}/mo rent</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-50">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </Card>

      {/* Property list below map */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => {
            const hasLocation = p.latitude && p.longitude;
            return (
              <Link key={p.id} href={`/properties/${p.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hasLocation ? "bg-blue-50" : "bg-slate-100"}`}>
                      {hasLocation ? <MapPin size={18} className="text-blue-600" /> : <Building2 size={18} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <Badge variant={getStatusBadgeVariant(p.status)} className="shrink-0 text-[10px]">
                          {p.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{p.address}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        {p.currentValue && <span className="font-semibold">{formatCurrency(p.currentValue)}</span>}
                        {!hasLocation && <span className="text-amber-500 font-medium">No location</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
