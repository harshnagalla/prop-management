import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bills, rentalIncome } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth/server";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [props, billsData, incomeData] = await Promise.all([
    db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId)),
    db
      .select({
        total: sql<string>`COALESCE(SUM(${bills.amount}::numeric), 0)`,
        unpaid: sql<string>`COALESCE(SUM(CASE WHEN ${bills.isPaid} = false THEN ${bills.amount}::numeric ELSE 0 END), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(bills)
      .where(eq(bills.userId, userId)),
    db
      .select({
        total: sql<string>`COALESCE(SUM(${rentalIncome.amount}::numeric), 0)`,
        thisMonth: sql<string>`COALESCE(SUM(CASE WHEN ${rentalIncome.month} = EXTRACT(MONTH FROM NOW()) AND ${rentalIncome.year} = EXTRACT(YEAR FROM NOW()) THEN ${rentalIncome.amount}::numeric ELSE 0 END), 0)`,
      })
      .from(rentalIncome)
      .where(eq(rentalIncome.userId, userId)),
  ]);

  const totalValue = props.reduce(
    (sum, p) => sum + (parseFloat(p.currentValue || "0")),
    0
  );
  const totalPurchase = props.reduce(
    (sum, p) => sum + (parseFloat(p.purchasePrice || "0")),
    0
  );
  const monthlyRent = props.reduce(
    (sum, p) => sum + (parseFloat(p.monthlyRent || "0")),
    0
  );
  const occupied = props.filter((p) => p.status === "occupied").length;

  return NextResponse.json({
    properties: {
      total: props.length,
      occupied,
      vacant: props.length - occupied,
      occupancyRate: props.length > 0 ? (occupied / props.length) * 100 : 0,
    },
    financials: {
      totalPortfolioValue: totalValue,
      totalPurchaseValue: totalPurchase,
      appreciation: totalPurchase > 0 ? ((totalValue - totalPurchase) / totalPurchase) * 100 : 0,
      monthlyRentalIncome: monthlyRent,
      annualRentalIncome: monthlyRent * 12,
      avgRentalYield: totalValue > 0 ? ((monthlyRent * 12) / totalValue) * 100 : 0,
      totalBills: parseFloat(billsData[0]?.total || "0"),
      unpaidBills: parseFloat(billsData[0]?.unpaid || "0"),
      totalIncomeReceived: parseFloat(incomeData[0]?.total || "0"),
      thisMonthIncome: parseFloat(incomeData[0]?.thisMonth || "0"),
    },
    propertyList: props.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      type: p.type,
      monthlyRent: parseFloat(p.monthlyRent || "0"),
      currentValue: parseFloat(p.currentValue || "0"),
      purchasePrice: parseFloat(p.purchasePrice || "0"),
      rentalYield:
        parseFloat(p.currentValue || "0") > 0
          ? ((parseFloat(p.monthlyRent || "0") * 12) / parseFloat(p.currentValue || "0")) * 100
          : 0,
      roi:
        parseFloat(p.purchasePrice || "0") > 0
          ? ((parseFloat(p.monthlyRent || "0") * 12) / parseFloat(p.purchasePrice || "0")) * 100
          : 0,
    })),
  });
}
