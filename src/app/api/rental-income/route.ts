import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rentalIncome, properties } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const propertyId = req.nextUrl.searchParams.get("propertyId");
  const conditions = [eq(rentalIncome.userId, userId)];
  if (propertyId) conditions.push(eq(rentalIncome.propertyId, propertyId));

  const result = await db
    .select({
      income: rentalIncome,
      propertyName: properties.name,
    })
    .from(rentalIncome)
    .leftJoin(properties, eq(rentalIncome.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(rentalIncome.year), desc(rentalIncome.month));

  return NextResponse.json(
    result.map((r) => ({ ...r.income, propertyName: r.propertyName }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const result = await db
    .insert(rentalIncome)
    .values({ ...body, userId })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
