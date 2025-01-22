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

    const transactions = await prisma.expense.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
        location: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category.name,
      location: transaction.location?.name || "N/A",
      date: transaction.date,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("[RECENT_TRANSACTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}