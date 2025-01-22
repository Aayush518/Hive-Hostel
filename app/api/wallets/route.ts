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

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("[WALLETS]", error);
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
    const { name, type, balance } = body;

    const wallet = await prisma.wallet.create({
      data: {
        name,
        type,
        balance,
        userId: session.user.id,
      },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("[WALLET_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}