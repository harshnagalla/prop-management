import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rentalIncome, properties } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const result = await db
    .select({
      id: rentalIncome.id,
      propertyId: rentalIncome.propertyId,
      userId: rentalIncome.userId,
      amount: rentalIncome.amount,
      month: rentalIncome.month,
      year: rentalIncome.year,
      receivedDate: rentalIncome.receivedDate,
      isReceived: rentalIncome.isReceived,
      tenantName: rentalIncome.tenantName,
      notes: rentalIncome.notes,
      createdAt: rentalIncome.createdAt,
      propertyName: properties.name,
      propertyAddress: properties.address,
      propertyCity: properties.city,
    })
    .from(rentalIncome)
    .leftJoin(properties, eq(rentalIncome.propertyId, properties.id))
    .where(and(eq(rentalIncome.id, id), eq(rentalIncome.userId, userId)));

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(rentalIncome)
    .set(body)
    .where(and(eq(rentalIncome.id, id), eq(rentalIncome.userId, userId)))
    .returning();

  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  await db
    .delete(rentalIncome)
    .where(and(eq(rentalIncome.id, id), eq(rentalIncome.userId, userId)));

  return NextResponse.json({ ok: true });
}
