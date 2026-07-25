import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { readToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("streakify_token")?.value;  //?.value => If the cookie exists, get its value. If it doesn't exist, return undefined instead of throwing an error
  const payload = readToken(token);

  if (!payload || typeof payload === "string") {
    return NextResponse.json(
      { message: "Not logged in." },
      { status: 401 }
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(payload.userId) },
    {
      projection: {
        passwordHash: 0,
      },
    }
  );

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    hearts: user.hearts,
    streak: user.streak,
    xp: user.xp,
  });
}