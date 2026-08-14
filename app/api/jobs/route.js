import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const userId = searchParams.get("userId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where = {};
  if (userId) where.userId = parseInt(userId);
  if (category) where.category = category;
  if (location) where.location = { contains: location };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, details, price, location, category, rating, userId } = body;

    if (!title || !description || !price || !location || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        details: details || null,
        price: parseFloat(price),
        location,
        category: category || null,
        rating: rating || 0,
        ratingCount: rating ? 1 : 0,
        userId: parseInt(userId),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
