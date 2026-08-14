import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get("userId"));
  if (!userId) return NextResponse.json({ reviews: [] });

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: { reviewer: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

export async function POST(request) {
  const body = await request.json();
  const { rating, comment, reviewerId, revieweeId, jobId } = body;

  if (!rating || !reviewerId || !revieweeId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(rating),
      comment: comment || null,
      reviewerId: parseInt(reviewerId),
      revieweeId: parseInt(revieweeId),
      jobId: jobId ? parseInt(jobId) : null,
    },
  });

  if (jobId) {
    const stats = await prisma.review.aggregate({
      where: { jobId: parseInt(jobId) },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.job.update({
      where: { id: parseInt(jobId) },
      data: { rating: stats._avg.rating || 0, ratingCount: stats._count.rating },
    });
  }

  return NextResponse.json(review, { status: 201 });
}
