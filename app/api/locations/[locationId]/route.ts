import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { locationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, type } = body;

    const location = await prisma.location.update({
      where: {
        id: params.locationId,
      },
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("[LOCATION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { locationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.location.delete({
      where: {
        id: params.locationId,
      },
    });

    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    console.error("[LOCATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}