import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { walletId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, type, balance } = body;

    const wallet = await prisma.wallet.update({
      where: {
        id: params.walletId,
        userId: session.user.id,
      },
      data: {
        name,
        type,
        balance,
      },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("[WALLET_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { walletId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First delete all expenses associated with this wallet
    await prisma.expense.deleteMany({
      where: {
        walletId: params.walletId,
        userId: session.user.id,
      },
    });

    // Then delete the wallet
    const wallet = await prisma.wallet.delete({
      where: {
        id: params.walletId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("[WALLET_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}