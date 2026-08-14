import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatar: true,
        _count: { select: { jobs: true, reviewsRecv: true } },
      },
    });

    const enriched = await Promise.all(
      users.map(async (u) => {
        const avg = await prisma.review.aggregate({
          where: { revieweeId: u.id },
          _avg: { rating: true },
        });
        return {
          ...u,
          avgRating: avg._avg.rating || 0,
          jobsCompleted: u._count.jobs,
          reviews: u._count.reviewsRecv,
        };
      })
    );

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
