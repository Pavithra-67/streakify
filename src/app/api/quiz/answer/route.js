import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { readToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
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

    const { questionId, selectedAnswer } = await request.json();

    if (!questionId || !selectedAnswer) {
      return NextResponse.json(
        { message: "Question ID and selected answer are required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const question = await db.collection("questions").findOne({
      _id: new ObjectId(questionId),
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found." },
        { status: 404 },
      );
    }

    const isCorrect = selectedAnswer === question.answer;

    let hearts = null;

    if (!isCorrect) {
      const userId = new ObjectId(payload.userId);

      const user = await db.collection("users").findOne({
        _id: userId,
      });

      const currentHearts = user.hearts ?? 5;

      if (currentHearts > 0) {
        await db.collection("users").updateOne(
          { _id: userId },
          {
            $inc: {
              hearts: -1,
            },
          },
        );

        hearts = currentHearts - 1;
      } else {
        hearts = 0;
      }
    }

    return NextResponse.json({
      correct: isCorrect,
      message: isCorrect
        ? "Excellent answer! You kept all your hearts."
        : "You lost one heart. Learn from this and try the next question!",
      hearts,
      correctAnswer: isCorrect ? null : question.answer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Could not check the answer.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
