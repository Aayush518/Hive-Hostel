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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const transactions = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: sixMonthsAgo,
        },
      },
    });

    const monthlyData = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = { name: monthKey, income: 0, expenses: 0 };
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === "INCOME") {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expenses += transaction.amount;
        }
      }
    });

    const chartData = Object.values(monthlyData).reverse();

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("[MONTHLY_TREND]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}