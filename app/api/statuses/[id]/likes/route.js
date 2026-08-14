import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();
    const statusId = parseInt(id);

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const existing = await prisma.statusLike.findUnique({
      where: { userId_statusId: { userId: parseInt(userId), statusId } },
    });

    if (existing) {
      await prisma.statusLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.statusLike.create({
      data: { userId: parseInt(userId), statusId },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
