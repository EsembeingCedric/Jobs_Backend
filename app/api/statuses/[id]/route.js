import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId"));

    const status = await prisma.status.findUnique({ where: { id: parseInt(id) } });
    if (!status) return NextResponse.json({ error: "Status not found" }, { status: 404 });
    if (status.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.status.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Status deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
