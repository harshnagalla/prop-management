import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, properties } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const propertyId = req.nextUrl.searchParams.get("propertyId");

  const conditions = [eq(bills.userId, userId)];
  if (propertyId) conditions.push(eq(bills.propertyId, propertyId));

  const result = await db
    .select({
      bill: bills,
      propertyName: properties.name,
    })
    .from(bills)
    .leftJoin(properties, eq(bills.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(bills.createdAt));

  return NextResponse.json(
    result.map((r) => ({ ...r.bill, propertyName: r.propertyName }))
  );
}

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const result = await db
    .insert(bills)
    .values({ ...body, userId })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
