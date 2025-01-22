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

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
        location: true,
        wallet: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("[EXPENSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { amount, type, description, date, categoryId, locationId, walletId } = body;

    // Start a transaction to ensure wallet balance is updated atomically
    const expense = await prisma.$transaction(async (tx) => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          amount,
          type,
          description,
          date,
          categoryId,
          locationId,
          walletId,
          userId: session.user.id,
        },
      });

      // Update wallet balance
      const balanceChange = type === "EXPENSE" ? -amount : amount;
      await tx.wallet.update({
        where: {
          id: walletId,
          userId: session.user.id,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return expense;
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("[EXPENSE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}