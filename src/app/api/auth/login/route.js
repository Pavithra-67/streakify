import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { createToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({
      email: cleanEmail,
    });

    if (!user) {
      return NextResponse.json(
        { message: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const token = createToken(user._id.toString());

    const response = NextResponse.json({
      message: "Logged in successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        hearts: user.hearts,
        streak: user.streak,
        xp: user.xp,
      },
    });

    response.cookies.set("streakify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);

    return NextResponse.json(
      {
        message: "Could not log in.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
