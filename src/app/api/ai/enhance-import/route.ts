export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { enhanceImportedProperties } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = rateLimit(`enhance:${session.user.id}`, 5, 60000);
  if (!success) return NextResponse.json({ error: "Rate limited." }, { status: 429 });

  const { properties: props } = await req.json();
  if (!props || !Array.isArray(props)) {
    return NextResponse.json({ error: "Missing properties array" }, { status: 400 });
  }

  try {
    const existing = await db
      .select({ name: properties.name, address: properties.address })
      .from(properties)
      .where(eq(properties.userId, session.user.id));

    const result = await enhanceImportedProperties(props, existing);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Enhance import error:", error);
    return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 });
  }
}
