import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { properties, bills, rentalIncome } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id)
    return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();

  // Fetch user's portfolio data as context
  const [props, billsData, incomeData] = await Promise.all([
    db
      .select()
      .from(properties)
      .where(eq(properties.userId, session.user.id)),
    db
      .select()
      .from(bills)
      .where(eq(bills.userId, session.user.id)),
    db
      .select()
      .from(rentalIncome)
      .where(eq(rentalIncome.userId, session.user.id)),
  ]);

  // Build context summary
  const totalValue = props.reduce(
    (s, p) => s + parseFloat(p.currentValue || "0"),
    0
  );
  const totalRent = props.reduce(
    (s, p) => s + parseFloat(p.monthlyRent || "0"),
    0
  );
  const totalBills = billsData.reduce(
    (s, b) => s + parseFloat(b.amount),
    0
  );
  const totalIncome = incomeData.reduce(
    (s, i) => s + parseFloat(i.amount),
    0
  );

  const context = `You are BhoomiQ AI assistant, helping an Indian property owner manage their portfolio.

PORTFOLIO DATA:
- Total properties: ${props.length}
- Total portfolio value: ₹${totalValue.toLocaleString("en-IN")}
- Monthly rent expected: ₹${totalRent.toLocaleString("en-IN")}
- Total bills: ₹${totalBills.toLocaleString("en-IN")}
- Total income received: ₹${totalIncome.toLocaleString("en-IN")}

PROPERTIES:
${props.map((p) => `- ${p.name}: Value ₹${parseFloat(p.currentValue || "0").toLocaleString("en-IN")}, Rent ₹${parseFloat(p.monthlyRent || "0").toLocaleString("en-IN")}/mo, Status: ${p.status}, Type: ${p.type}, Ownership: ${p.ownership || "100%"}, Area: ${p.areaDetails || "N/A"}, Stamp Duty: ₹${parseFloat(p.stampDuty || "0").toLocaleString("en-IN")}, Dastavej: ${p.dastavejNo || "N/A"}`).join("\n")}

BILLS (${billsData.length} total):
${billsData.slice(0, 20).map((b) => `- ${b.category}: ₹${parseFloat(b.amount).toLocaleString("en-IN")} (${b.isPaid ? "Paid" : "Unpaid"})`).join("\n")}

INCOME (${incomeData.length} records):
${incomeData.slice(0, 20).map((i) => `- ${i.month}/${i.year}: ₹${parseFloat(i.amount).toLocaleString("en-IN")} (${i.isReceived ? "Received" : "Pending"})`).join("\n")}

Answer questions about their portfolio using this data. Be specific with numbers. Use ₹ and Indian number formatting (lakhs, crores). Be concise and helpful.`;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: context,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
