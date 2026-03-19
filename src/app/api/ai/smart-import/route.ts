export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { smartImportProperties } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = rateLimit(`smart-import:${session.user.id}`, 5, 60000);
  if (!success) return NextResponse.json({ error: "Rate limited. Please wait a moment." }, { status: 429 });

  const { csvText } = await req.json();
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "Missing csvText" }, { status: 400 });
  }

  try {
    // Fetch existing properties for duplicate context
    const existing = await db
      .select({ name: properties.name, address: properties.address })
      .from(properties)
      .where(eq(properties.userId, session.user.id));

    const result = await smartImportProperties(csvText, existing);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Smart import error:", error);

    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json({ error: "AI rate limited, try again in a moment" }, { status: 429 });
    }
    return NextResponse.json({ error: "AI failed to parse the spreadsheet" }, { status: 500 });
  }
}
