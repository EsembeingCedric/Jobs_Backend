import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

async function saveAvatar(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and GIF images are allowed");
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Image must be under 5MB");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const filename = `avatar-signup-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return `/uploads/${filename}`;
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let name, email, password, phone, avatar = null;

    if (contentType.includes("application/json")) {
      ({ name, email, password, phone } = await req.json());
    } else {
      const formData = await req.formData();
      name = formData.get("name");
      email = formData.get("email");
      password = formData.get("password");
      phone = formData.get("phone") || null;
      const file = formData.get("avatar");
      if (file && file.name) {
        avatar = await saveAvatar(file);
      }
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        phone: phone || null,
        avatar,
      },
      select: { id: true, name: true, email: true, phone: true, bio: true, avatar: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
