import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, details, price, location, category } = body;
    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { title, description, details, price: price ? parseFloat(price) : undefined, location, category },
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
