import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, propertyValueHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();

  if (!body.name || typeof body.name !== "string" || body.name.length > 500) {
    return NextResponse.json({ error: "Invalid property name" }, { status: 400 });
  }
  if (!body.address || typeof body.address !== "string" || body.address.length > 1000) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const result = await db
    .insert(properties)
    .values({ ...body, userId })
    .returning();

  if (body.currentValue && result[0]) {
    await db.insert(propertyValueHistory).values({
      propertyId: result[0].id,
      userId,
      value: body.currentValue,
    });
  }

  return NextResponse.json(result[0], { status: 201 });
}
