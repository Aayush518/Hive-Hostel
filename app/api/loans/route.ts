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

    // Test database connection before proceeding
    await prisma.$connect();

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
    console.error("[LOANS_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch loans",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    await prisma.$disconnect();
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

    // Validate input
    if (!amount || !description || !borrowerId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Test database connection before proceeding
    await prisma.$connect();

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
    console.error("[LOAN_POST_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create loan",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}