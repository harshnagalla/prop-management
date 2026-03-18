import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bills, rentalIncome, documents } from "@/lib/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

interface Notification {
  type: "overdue_bill" | "no_income" | "vacant" | "no_documents";
  title: string;
  message: string;
  propertyId?: string;
  severity: "warning" | "info";
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [userProperties, overdueBills, incomeThisMonth, propertyDocs] =
    await Promise.all([
      db.select().from(properties).where(eq(properties.userId, userId)),

      db
        .select({
          id: bills.id,
          propertyId: bills.propertyId,
          category: bills.category,
          amount: bills.amount,
          dueDate: bills.dueDate,
        })
        .from(bills)
        .where(
          and(
            eq(bills.userId, userId),
            eq(bills.isPaid, false),
            lt(bills.dueDate, now)
          )
        ),

      db
        .select({
          propertyId: rentalIncome.propertyId,
          total: sql<string>`COALESCE(SUM(${rentalIncome.amount}::numeric), 0)`,
        })
        .from(rentalIncome)
        .where(
          and(
            eq(rentalIncome.userId, userId),
            eq(rentalIncome.month, currentMonth),
            eq(rentalIncome.year, currentYear)
          )
        )
        .groupBy(rentalIncome.propertyId),

      db
        .select({
          propertyId: documents.propertyId,
          count: sql<number>`COUNT(*)`,
        })
        .from(documents)
        .where(eq(documents.userId, userId))
        .groupBy(documents.propertyId),
    ]);

  const notifications: Notification[] = [];

  // Overdue bills
  const propertyMap = new Map(userProperties.map((p) => [p.id, p.name]));
  for (const bill of overdueBills) {
    const propertyName = propertyMap.get(bill.propertyId) || "Unknown";
    notifications.push({
      type: "overdue_bill",
      title: "Overdue Bill",
      message: `${bill.category.replace(/_/g, " ")} bill of ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(parseFloat(bill.amount))} for ${propertyName} is overdue`,
      propertyId: bill.propertyId,
      severity: "warning",
    });
  }

  // Properties with no income this month
  const incomePropertyIds = new Set(incomeThisMonth.map((i) => i.propertyId));
  const occupiedProperties = userProperties.filter(
    (p) => p.status === "occupied"
  );
  for (const prop of occupiedProperties) {
    if (!incomePropertyIds.has(prop.id)) {
      notifications.push({
        type: "no_income",
        title: "No Income Recorded",
        message: `No rental income recorded for ${prop.name} this month`,
        propertyId: prop.id,
        severity: "info",
      });
    }
  }

  // Vacant properties
  const vacantProperties = userProperties.filter(
    (p) => p.status === "vacant"
  );
  for (const prop of vacantProperties) {
    notifications.push({
      type: "vacant",
      title: "Vacant Property",
      message: `${prop.name} is currently vacant`,
      propertyId: prop.id,
      severity: "info",
    });
  }

  // Properties without documents
  const docPropertyIds = new Set(propertyDocs.map((d) => d.propertyId));
  for (const prop of userProperties) {
    if (!docPropertyIds.has(prop.id)) {
      notifications.push({
        type: "no_documents",
        title: "No Documents",
        message: `${prop.name} has no documents uploaded`,
        propertyId: prop.id,
        severity: "info",
      });
    }
  }

  return NextResponse.json(notifications);
}
