import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { amount, type, description, date, categoryId, locationId, walletId } = body;

    // Get the original expense to calculate balance adjustment
    const originalExpense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
        userId: session.user.id,
      },
    });

    if (!originalExpense) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Start a transaction to ensure wallet balances are updated atomically
    const expense = await prisma.$transaction(async (tx) => {
      // If the wallet is changing, we need to update both wallets
      if (walletId !== originalExpense.walletId) {
        // Reverse the original transaction from the old wallet
        const oldWalletChange = originalExpense.type === "EXPENSE" 
          ? originalExpense.amount 
          : -originalExpense.amount;
        
        await tx.wallet.update({
          where: {
            id: originalExpense.walletId,
            userId: session.user.id,
          },
          data: {
            balance: {
              increment: oldWalletChange,
            },
          },
        });

        // Apply the new transaction to the new wallet
        const newWalletChange = type === "EXPENSE" ? -amount : amount;
        await tx.wallet.update({
          where: {
            id: walletId,
            userId: session.user.id,
          },
          data: {
            balance: {
              increment: newWalletChange,
            },
          },
        });
      } else {
        // Same wallet, just update the balance difference
        const oldAmount = originalExpense.type === "EXPENSE" 
          ? -originalExpense.amount 
          : originalExpense.amount;
        const newAmount = type === "EXPENSE" ? -amount : amount;
        const balanceChange = newAmount - oldAmount;

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
      }

      // Update the expense
      return await tx.expense.update({
        where: {
          id: params.expenseId,
          userId: session.user.id,
        },
        data: {
          amount,
          type,
          description,
          date,
          categoryId,
          locationId,
          walletId,
        },
      });
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the expense to calculate balance adjustment
    const expense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Start a transaction to ensure wallet balance is updated atomically
    await prisma.$transaction(async (tx) => {
      // Reverse the transaction amount in the wallet
      const balanceChange = expense.type === "EXPENSE" 
        ? expense.amount 
        : -expense.amount;

      await tx.wallet.update({
        where: {
          id: expense.walletId,
          userId: session.user.id,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      // Delete the expense
      await tx.expense.delete({
        where: {
          id: params.expenseId,
          userId: session.user.id,
        },
      });
    });

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("[EXPENSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}