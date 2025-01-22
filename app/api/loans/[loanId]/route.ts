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

    const loans = await prisma.loan.findMany({
      where: {
        OR: [
          { lenderId: session.user.id },
          { borrowerId: session.user.id },
          { guarantorId: session.user.id },
        ],
      },
      include: {
        lender: {
          select: {
            name: true,
            email: true,
          },
        },
        borrower: {
          select: {
            name: true,
            email: true,
          },
        },
        guarantor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("[LOANS]", error);
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
    const { amount, description, dueDate, borrowerId, guarantorId } = body;

    const loan = await prisma.loan.create({
      data: {
        amount,
        description,
        dueDate,
        status: "PENDING",
        lenderId: session.user.id,
        borrowerId,
        guarantorId,
      },
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error("[LOAN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}