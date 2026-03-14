import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, properties } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const propertyId = req.nextUrl.searchParams.get("propertyId");
  const conditions = [eq(documents.userId, userId)];
  if (propertyId) conditions.push(eq(documents.propertyId, propertyId));

  const result = await db
    .select({
      id: documents.id,
      propertyId: documents.propertyId,
      userId: documents.userId,
      name: documents.name,
      type: documents.type,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
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
  const { propertyId, name, type, file, mimeType, fileSize } = body;

  if (!propertyId || !name || !file) {
    return NextResponse.json(
      { error: "propertyId, name, and file are required" },
      { status: 400 }
    );
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 10MB limit" },
      { status: 400 }
    );
  }

  // file is expected to be a data URI: data:{mimeType};base64,{data}
  const fileUrl = file.startsWith("data:") ? file : `data:${mimeType || "application/octet-stream"};base64,${file}`;

  const result = await db
    .insert(documents)
    .values({
      propertyId,
      name,
      type: type || "other",
      fileUrl,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      userId,
    })
    .returning({
      id: documents.id,
      propertyId: documents.propertyId,
      name: documents.name,
      type: documents.type,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  return NextResponse.json(result[0], { status: 201 });
}
