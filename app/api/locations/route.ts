import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("[LOCATIONS]", error);
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
    const { name, type } = body;

    const location = await prisma.location.create({
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("[LOCATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}