import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { readToken } from "@/lib/auth";

export const runtime = "nodejs";
function getDateOnly(date) {
  return date.toISOString().split("T")[0];
}
export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("streakify_token")?.value;

    const payload = readToken(token);

    if (!payload || typeof payload === "string") {
      return NextResponse.json(
        { message: "You are not logged in." },
        { status: 401 },
      );
    }

    const client = await clientPromise;

    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      {
        projection: {
          passwordHash: 0, //Don't return this field
        },
      },
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const today = getDateOnly(new Date());

    if (user.lastHeartRefillDate !== today) {
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            hearts: 5,
            lastHeartRefillDate: today,
          },
        },
      );

      user.hearts = 5;
    }
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      streak: user.streak || 0,
      hearts: user.hearts ?? 5,
      xp: user.xp || 0,
      lastCompletedDate: user.lastCompletedDate || null,
      completedQuestionIds: (user.completedQuestionIds || []).map((id) =>
        id.toString(),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load user.", error: error.message },
      { status: 500 },
    );
  }
}
