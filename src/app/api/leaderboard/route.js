import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            name: 1,
            xp: 1,
            streak: 1,
          },
        }
      )
      .sort({ xp: -1, streak: -1 })
      .limit(20)
      .toArray();

    const leaderboard = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      xp: user.xp || 0,
      streak: user.streak || 0,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load leaderboard.", error: error.message },
      { status: 500 }
    );
  }
}