import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const [statuses, total] = await Promise.all([
      prisma.status.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          likes: { select: { userId: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.status.count(),
    ]);

    return NextResponse.json({
      data: statuses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { content, userId } = await req.json();
    if (!content || !userId) {
      return NextResponse.json({ error: "Content and userId are required" }, { status: 400 });
    }

    const status = await prisma.status.create({
      data: { content, userId: parseInt(userId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        likes: { select: { userId: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ data: status }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
