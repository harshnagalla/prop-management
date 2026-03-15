import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, rentalIncome } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const monthRange = generateLast12Months();

  const [incomeRows, expenseCategoryRows, expenseMonthlyRows] = await Promise.all([
    // Monthly income (last 12 months)
    db
      .select({
        year: rentalIncome.year,
        month: rentalIncome.month,
        total: sql<string>`COALESCE(SUM(${rentalIncome.amount}::numeric), 0)`,
      })
      .from(rentalIncome)
      .where(eq(rentalIncome.userId, userId))
      .groupBy(rentalIncome.year, rentalIncome.month)
      .orderBy(rentalIncome.year, rentalIncome.month),

    // Expense breakdown by category
    db
      .select({
        category: bills.category,
        total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
      })
      .from(bills)
      .where(eq(bills.userId, userId))
      .groupBy(bills.category)
      .orderBy(sql`SUM(${bills.amount}::numeric) DESC`),

    // Monthly expenses (last 12 months) using dueDate with createdAt fallback
    db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))::int`,
        month: sql<number>`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))::int`,
        total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
      })
      .from(bills)
      .where(eq(bills.userId, userId))
      .groupBy(
        sql`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`,
        sql`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`,
        sql`EXTRACT(MONTH FROM COALESCE(${bills.dueDate}, ${bills.createdAt}))`
      ),
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

  // Fill 12-month range with data or 0
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

  return NextResponse.json({
    monthlyIncome,
    expenseByCategory,
    monthlyExpenses,
  });
}
