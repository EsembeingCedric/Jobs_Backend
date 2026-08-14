import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [totalJobs, avgResult, totalReviews, totalUsers] = await Promise.all([
    prisma.job.count(),
    prisma.job.aggregate({ _avg: { rating: true }, where: { rating: { gt: 0 } } }),
    prisma.review.count(),
    prisma.user.count(),
  ]);

  const recentJobs = await prisma.job.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    stats: {
      totalJobs,
      avgRating: avgResult._avg.rating || 0,
      totalReviews,
      totalUsers,
    },
    recentJobs,
  });
}
