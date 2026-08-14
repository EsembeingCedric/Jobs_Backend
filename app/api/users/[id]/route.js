import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true, name: true, email: true, phone: true, bio: true, avatar: true, createdAt: true,
      _count: { select: { jobs: true, reviewsRecv: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const avgResult = await prisma.review.aggregate({
    where: { revieweeId: parseInt(id) },
    _avg: { rating: true },
  });

  return NextResponse.json({ ...user, avgRating: avgResult._avg.rating || 0 });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const userId = parseInt(id);

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (body.email && body.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: body.email } });
    if (emailTaken) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.bio !== undefined) data.bio = body.bio || null;
  if (body.password) data.password = crypto.createHash("sha256").update(body.password).digest("hex");

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, bio: true, avatar: true },
  });

  return NextResponse.json({ user });
}
