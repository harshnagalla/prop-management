import { NextRequest, NextResponse } from "next/server";
import { extractBankTransactions } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file, mimeType } = await req.json();

  if (!file || !mimeType) {
    return NextResponse.json({ error: "Missing file or mimeType" }, { status: 400 });
  }

  if (file.length > 20_000_000) {
    return NextResponse.json({ error: "File too large. Maximum 15MB." }, { status: 400 });
  }

  try {
    const data = await extractBankTransactions(file, mimeType);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Bank extraction error:", error);

    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json({ error: "AI service rate limited, try again in a moment" }, { status: 429 });
    }

    return NextResponse.json({ error: "Failed to extract transactions from statement" }, { status: 500 });
  }
}
