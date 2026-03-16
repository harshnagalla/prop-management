import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bills, rentalIncome } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

function generateLast12Months(): { label: string; month: number; year: number }[] {
  const months: { label: string; month: number; year: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    months.push({ label, month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return months;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  // Verify property ownership
  const property = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId)));

  if (!property.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const monthRange = generateLast12Months();

  const [incomeRows, expenseMonthlyRows, expenseCategoryRows, totalIncomeRow, totalExpensesRow] =
    await Promise.all([
      // Monthly income (last 12 months)
      db
        .select({
          year: rentalIncome.year,
          month: rentalIncome.month,
          total: sql<string>`COALESCE(SUM(${rentalIncome.amount}::numeric), 0)`,
        })
        .from(rentalIncome)
        .where(
          and(eq(rentalIncome.propertyId, id), eq(rentalIncome.userId, userId))
        )
        .groupBy(rentalIncome.year, rentalIncome.month)
        .orderBy(rentalIncome.year, rentalIncome.month),

      // Monthly expenses (last 12 months)
      db
        .select({
          year: sql<number>`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))::int`,
          month: sql<number>`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))::int`,
          total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
        })
        .from(bills)
        .where(and(eq(bills.propertyId, id), eq(bills.userId, userId)))
        .groupBy(
          sql`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`,
          sql`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`
        )
        .orderBy(
          sql`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`,
          sql`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`
        ),

      // Expense breakdown by category
      db
        .select({
          category: bills.category,
          total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
        })
        .from(bills)
        .where(and(eq(bills.propertyId, id), eq(bills.userId, userId)))
        .groupBy(bills.category)
        .orderBy(sql`SUM(${bills.amount}::numeric) DESC`),

      // Total income (all time)
      db
        .select({
          total: sql<string>`COALESCE(SUM(${rentalIncome.amount}::numeric), 0)`,
        })
        .from(rentalIncome)
        .where(
          and(eq(rentalIncome.propertyId, id), eq(rentalIncome.userId, userId))
        ),

      // Total expenses (all time)
      db
        .select({
          total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
        })
        .from(bills)
        .where(and(eq(bills.propertyId, id), eq(bills.userId, userId))),
    ]);

  // Build income lookup
  const incomeMap = new Map<string, number>();
  for (const row of incomeRows) {
    incomeMap.set(`${row.year}-${row.month}`, parseFloat(row.total));
  }

  // Build expense lookup
  const expenseMap = new Map<string, number>();
  for (const row of expenseMonthlyRows) {
    expenseMap.set(`${row.year}-${row.month}`, parseFloat(row.total));
  }

  // Fill 12-month range
  const monthlyIncome = monthRange.map((m) => ({
    month: m.label,
    amount: incomeMap.get(`${m.year}-${m.month}`) ?? 0,
  }));

  const monthlyExpenses = monthRange.map((m) => ({
    month: m.label,
    amount: expenseMap.get(`${m.year}-${m.month}`) ?? 0,
  }));

  const expenseByCategory = expenseCategoryRows
    .map((row) => ({
      category: row.category,
      amount: parseFloat(row.total),
    }))
    .filter((row) => row.amount > 0);

  const totalIncome = parseFloat(totalIncomeRow[0]?.total ?? "0");
  const totalExpenses = parseFloat(totalExpensesRow[0]?.total ?? "0");

  return NextResponse.json({
    monthlyIncome,
    monthlyExpenses,
    expenseByCategory,
    summary: {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
    },
  });
}
