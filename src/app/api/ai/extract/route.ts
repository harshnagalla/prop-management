export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { extractBillData, extractSpreadsheetData } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = rateLimit(`ai-extract:${session.user.id}`, 10, 60000);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limited. Please wait a moment." },
      { status: 429 }
    );
  }

  const { file, mimeType, mode } = await req.json();

  if (!file || !mimeType) {
    return NextResponse.json({ error: "Missing file or mimeType" }, { status: 400 });
  }

  // File size validation: base64 string > 20MB ≈ 15MB decoded
  if (file.length > 20_000_000) {
    return NextResponse.json(
      { error: "File too large. Maximum 15MB." },
      { status: 400 }
    );
  }

  try {
    if (mode === "spreadsheet") {
      const data = await extractSpreadsheetData(file, mimeType);
      return NextResponse.json(data);
    } else {
      const data = await extractBillData(file, mimeType);
      return NextResponse.json(data);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error("AI extraction error:", error);

    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json(
        { error: "AI service rate limited, please try again in a moment" },
        { status: 429 }
      );
    }

    if (message.includes("invalid") || message.includes("schema")) {
      return NextResponse.json(
        { error: "Could not extract structured data from this document" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract data from document" },
      { status: 500 }
    );
  }
}
