import { NextRequest, NextResponse } from "next/server";
import { extractBillData, extractSpreadsheetData } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file, mimeType, mode } = await req.json();

  if (!file || !mimeType) {
    return NextResponse.json({ error: "Missing file or mimeType" }, { status: 400 });
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
    console.error("AI extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from document" },
      { status: 500 }
    );
  }
}
