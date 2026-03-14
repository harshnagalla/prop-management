import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, properties } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const propertyId = req.nextUrl.searchParams.get("propertyId");
  const conditions = [eq(documents.userId, userId)];
  if (propertyId) conditions.push(eq(documents.propertyId, propertyId));

  const result = await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const result = await db
    .insert(documents)
    .values({ ...body, userId })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
