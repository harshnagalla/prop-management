import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, propertyRemarks } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const remarks = await db
    .select()
    .from(propertyRemarks)
    .where(
      and(
        eq(propertyRemarks.propertyId, id),
        eq(propertyRemarks.userId, userId)
      )
    )
    .orderBy(desc(propertyRemarks.createdAt));

  return NextResponse.json(remarks);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const body = await req.json();
  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  // Verify property exists and belongs to user
  const prop = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId)));

  if (!prop.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await db
    .insert(propertyRemarks)
    .values({ propertyId: id, userId, content })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  await params;

  const remarkId = req.nextUrl.searchParams.get("remarkId");
  if (!remarkId) {
    return NextResponse.json(
      { error: "remarkId is required" },
      { status: 400 }
    );
  }

  await db
    .delete(propertyRemarks)
    .where(
      and(
        eq(propertyRemarks.id, remarkId),
        eq(propertyRemarks.userId, userId)
      )
    );

  return NextResponse.json({ ok: true });
}
