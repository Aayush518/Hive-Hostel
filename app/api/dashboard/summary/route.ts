import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total balance from all wallets
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { balance: true },
    });
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    // Get monthly income and expenses
    const monthlyTransactions = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 
      ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
      : 0;

    return NextResponse.json({
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      savingsRate,
    });
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}