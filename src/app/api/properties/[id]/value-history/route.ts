import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { propertyValueHistory, properties } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  // Verify property belongs to user
  const prop = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId)));

  if (!prop.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await db
    .select()
    .from(propertyValueHistory)
    .where(eq(propertyValueHistory.propertyId, id))
    .orderBy(asc(propertyValueHistory.recordedAt));

  return NextResponse.json(result);
}
