import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { readToken } from "@/lib/auth";

export const runtime = "nodejs";

const HEART_COST = 50;
const MAX_HEARTS = 5;

export async function POST() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("streakify_token")?.value;

    const payload = readToken(token);

    if (!payload || typeof payload === "string") {
      return NextResponse.json(
        { message: "You are not logged in." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const users = db.collection("users");

    const user = await users.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const currentHearts = user.hearts ?? MAX_HEARTS;
    const currentXp = user.xp || 0;

    if (currentHearts >= MAX_HEARTS) {
      return NextResponse.json(
        { message: "Your hearts are already full." },
        { status: 400 }
      );
    }

    if (currentXp < HEART_COST) {
      return NextResponse.json(
        { message: `You need ${HEART_COST} XP to buy one heart.` },
        { status: 400 }
      );
    }

    await users.updateOne(
      { _id: user._id },
      {
        $inc: {
          hearts: 1,
          xp: -HEART_COST,
        },
      }
    );

    return NextResponse.json({
      message: "You bought one heart!",
      hearts: currentHearts + 1,
      xp: currentXp - HEART_COST,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not buy heart.", error: error.message },
      { status: 500 }
    );
  }
}