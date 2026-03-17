import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { propertyId } = await req.json();

  // If propertyId provided, geocode just that one. Otherwise geocode all without coordinates.
  const toGeocode = propertyId
    ? await db.select().from(properties).where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
    : await db.select().from(properties).where(and(eq(properties.userId, userId), isNull(properties.latitude)));

  let geocoded = 0;
  for (const prop of toGeocode) {
    const query = `${prop.address}, ${prop.city || "Ahmedabad"}, Gujarat, India`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "User-Agent": "BhoomiQ/1.0 (property-management)" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        await db.update(properties)
          .set({ latitude: data[0].lat, longitude: data[0].lon })
          .where(eq(properties.id, prop.id));
        geocoded++;
      }
      // Nominatim rate limit: 1 req/sec
      await new Promise((r) => setTimeout(r, 1100));
    } catch {
      // Skip failed geocoding
    }
  }

  return NextResponse.json({ geocoded, total: toGeocode.length });
}
