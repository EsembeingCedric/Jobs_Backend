import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get("userId"));
  const otherUserId = searchParams.get("otherUserId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (otherUserId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: parseInt(otherUserId) },
          { senderId: parseInt(otherUserId), receiverId: userId },
        ],
      },
      include: { sender: { select: { id: true, name: true, avatar: true } }, receiver: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ messages });
  }

  const sentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });
  const recvMessages = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const userIds = [...new Set([
    ...sentMessages.map((m) => m.receiverId),
    ...recvMessages.map((m) => m.senderId),
  ])];

  const conversations = [];
  for (const otherId of userIds) {
    const lastMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    const otherUser = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, name: true, avatar: true },
    });
    if (lastMessage && otherUser) {
      conversations.push({ otherUser, lastMessage });
    }
  }

  conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  return NextResponse.json({ conversations });
}

export async function POST(request) {
  const body = await request.json();
  const { text, senderId, receiverId, jobId } = body;

  if (!text || !senderId || !receiverId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      text,
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      jobId: jobId ? parseInt(jobId) : null,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
