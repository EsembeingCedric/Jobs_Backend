import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, phone: true, bio: true, avatar: true, createdAt: true },
    });

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
