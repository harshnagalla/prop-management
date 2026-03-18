"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Building2, RefreshCw, MapPin, IndianRupee, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import type { Property } from "@/lib/db/schema";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

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

function getStatusDot(status: string) {
  switch (status) {
    case "occupied": return "bg-emerald-500";
    case "vacant": return "bg-slate-400";
    case "under_renovation": return "bg-amber-500";
    case "for_sale": return "bg-blue-500";
    case "sold": return "bg-red-500";
    default: return "bg-slate-400";
  }
}

function formatCompact(val: string | null): string {
  if (!val) return "—";
  const n = parseFloat(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function createBubbleIcon(L: typeof import("leaflet"), property: Property, isSelected: boolean) {
  const value = formatCompact(property.currentValue);
  const statusColor = property.status === "occupied" ? "#059669"
    : property.status === "vacant" ? "#94a3b8"
    : property.status === "sold" ? "#dc2626"
    : property.status === "for_sale" ? "#3b82f6"
    : "#d97706";

  const bg = isSelected ? "#1e40af" : "#ffffff";
  const text = isSelected ? "#ffffff" : "#1e293b";
  const border = isSelected ? "#1e40af" : "#e2e8f0";
  const shadow = isSelected ? "0 4px 12px rgba(30,64,175,0.35)" : "0 2px 8px rgba(0,0,0,0.12)";

  return L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};
      color:${text};
      border:2px solid ${border};
      border-radius:20px;
      padding:4px 10px;
      font-size:12px;
      font-weight:700;
      font-family:system-ui,sans-serif;
      white-space:nowrap;
      box-shadow:${shadow};
      cursor:pointer;
      display:flex;
      align-items:center;
      gap:5px;
      transition:all 0.15s;
      position:relative;
    ">
      <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};flex-shrink:0"></span>
      ${value}
      <div style="
        position:absolute;
        bottom:-6px;
        left:50%;
        transform:translateX(-50%);
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:6px solid ${border};
      "></div>
      <div style="
        position:absolute;
        bottom:-4px;
        left:50%;
        transform:translateX(-50%);
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:5px solid ${bg};
      "></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [40, 35],
    popupAnchor: [0, -35],
  });
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [leafletLib, setLeafletLib] = useState<typeof import("leaflet") | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    import("leaflet").then((L) => { setLeafletLib(L); setLeafletReady(true); });
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
      const updated = await fetch("/api/properties").then((r) => r.json());
      setProperties(updated);
    } catch { toast.error("Geocoding failed"); }
    finally { setGeocoding(false); }
  };

  const mapped = properties.filter((p) => p.latitude && p.longitude);
  const unmapped = properties.filter((p) => !p.latitude || !p.longitude);

  const center: [number, number] = mapped.length > 0
    ? [
        mapped.reduce((s, p) => s + parseFloat(p.latitude || "0"), 0) / mapped.length,
        mapped.reduce((s, p) => s + parseFloat(p.longitude || "0"), 0) / mapped.length,
      ]
    : [23.0225, 72.5714];

  if (loading) {
    return (
      <div className="pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-9 w-36 bg-muted rounded" />
          <div className="h-10 w-40 bg-muted rounded" />
        </div>
        <div className="h-[calc(100vh-140px)] bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pt-14 md:pt-0 flex flex-col h-[calc(100vh-48px)] md:h-[calc(100vh-32px)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Map</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {mapped.length} of {properties.length} on map
            {unmapped.length > 0 && <span className="text-amber-500 font-medium"> · {unmapped.length} need location</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {unmapped.length > 0 && (
            <Button onClick={geocodeAll} disabled={geocoding} size="sm" className="gap-1.5">
              <RefreshCw size={14} className={geocoding ? "animate-spin" : ""} />
              {geocoding ? "Locating..." : "Locate All"}
            </Button>
          )}
        </div>
      </div>

      {/* Split panel: List + Map */}
      <div className="flex-1 flex gap-0 rounded-2xl overflow-hidden border border-slate-200 bg-white min-h-0">
        {/* Left: Property list */}
        <div className="hidden md:flex flex-col w-[340px] border-r border-slate-100 shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {properties.length} Properties
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {properties.map((p) => {
              const hasLoc = p.latitude && p.longitude;
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(isSelected ? null : p.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-colors",
                    isSelected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-slate-50 border-l-2 border-l-transparent"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", getStatusDot(p.status))} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", isSelected && "text-blue-700")}>{p.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{p.address}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {p.currentValue && (
                        <span className="text-xs font-bold text-slate-800">{formatCompact(p.currentValue)}</span>
                      )}
                      {p.monthlyRent && (
                        <span className="text-[10px] text-slate-400">{formatCompact(p.monthlyRent)}/mo</span>
                      )}
                      <Badge variant={getStatusBadgeVariant(p.status)} className="text-[9px] px-1.5 py-0">
                        {p.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    {!hasLoc && <p className="text-[10px] text-amber-500 mt-1">No location</p>}
                  </div>
                  <Link href={`/properties/${p.id}`} onClick={(e) => e.stopPropagation()} className="mt-1 text-slate-300 hover:text-blue-600 transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Map */}
        <div className="flex-1 relative">
          {leafletReady && leafletLib ? (
            <MapContainer center={center} zoom={12} className="h-full w-full z-0" zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {mapped.map((p) => (
                <Marker
                  key={p.id}
                  position={[parseFloat(p.latitude!), parseFloat(p.longitude!)]}
                  icon={createBubbleIcon(leafletLib, p, selectedId === p.id)}
                  eventHandlers={{
                    click: () => setSelectedId(selectedId === p.id ? null : p.id),
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px] p-1">
                      <Link href={`/properties/${p.id}`} className="text-sm font-bold text-blue-600 hover:underline block">
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{p.address}</p>
                      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100">
                        {p.currentValue && (
                          <div>
                            <p className="text-[10px] text-slate-400">Value</p>
                            <p className="text-xs font-bold">{formatCurrency(p.currentValue)}</p>
                          </div>
                        )}
                        {p.monthlyRent && (
                          <div>
                            <p className="text-[10px] text-slate-400">Rent/mo</p>
                            <p className="text-xs font-bold">{formatCurrency(p.monthlyRent)}</p>
                          </div>
                        )}
                        <Badge variant={getStatusBadgeVariant(p.status)} className="text-[10px] ml-auto">
                          {p.status?.replace("_", " ")}
                        </Badge>
                      </div>
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
      </div>

      {/* Mobile property list */}
      <div className="md:hidden mt-4 space-y-2">
        {properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("w-2 h-8 rounded-full shrink-0", getStatusDot(p.status))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.address}</p>
                </div>
                {p.currentValue && <span className="text-xs font-bold shrink-0">{formatCompact(p.currentValue)}</span>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
