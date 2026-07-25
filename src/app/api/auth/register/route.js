import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { createToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must contain at least 8 characters." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    const existingUser = await users.findOne({ email: cleanEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    //12 => salt round or cost factor
    const result = await users.insertOne({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      hearts: 5,
      streak: 0,
      xp: 0,
      lastCompletedDate: null,
      completedQuestionIds: [],
      createdAt: new Date(),
    });

    const token = createToken(result.insertedId.toString());

    const response = NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: result.insertedId.toString(),
          name: cleanName,
          email: cleanEmail,
          hearts: 5,
          streak: 0,
          xp: 0,
        },
      },
      { status: 201 },
    );

    response.cookies.set("streakify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, //cookie last for 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: "Could not create account.", debug: error.message },
      { status: 500 },
    );
  }
}
