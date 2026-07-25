import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { readToken } from "@/lib/auth";

export const runtime = "nodejs";

function getDateOnly(date) {
  return date.toISOString().split("T")[0];
}

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

    const { answers, course } = await request.json();

    const allowedCourses = ["all", "sql", "nosql", "java", "javascript", "dcn"];

    if (!allowedCourses.includes(course)) {
      return NextResponse.json({ message: "Invalid course." }, { status: 400 });
    }

    if (!Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { message: "Please answer all five questions." },
        { status: 400 },
      );
    }

    const uniqueQuestionIds = new Set(
      answers.map((answer) => answer.questionId),
    );

    if (uniqueQuestionIds.size !== 5) {
      return NextResponse.json(
        { message: "Each submitted question must be different." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const users = db.collection("users");
    const dailyProgress = db.collection("dailyProgress");

    const userId = new ObjectId(payload.userId);
    const today = getDateOnly(new Date());

    const existingProgress = await dailyProgress.findOne({
      userId,
      date: today,
    });

    if (existingProgress?.completed) {
      return NextResponse.json(
        { message: "You already completed today's lesson." },
        { status: 400 },
      );
    }

    const questionIds = answers.map(
      (answer) => new ObjectId(answer.questionId),
    );

    const realQuestions = await db
      .collection("questions")
      .find({
        _id: {
          $in: questionIds,
        },
      })
      .toArray();

    if (realQuestions.length !== 5) {
      return NextResponse.json(
        { message: "One or more questions do not exist." },
        { status: 400 },
      );
    }

    let correctAnswers = 0;
    const correctQuestionIds = [];

    for (const userAnswer of answers) {
      const realQuestion = realQuestions.find(
        (question) => question._id.toString() === userAnswer.questionId,
      );

      if (realQuestion.answer === userAnswer.selectedAnswer) {
        correctAnswers += 1;
        correctQuestionIds.push(realQuestion._id);
      }
    }

    const user = await users.findOne({ _id: userId });

    const yesterdayObject = new Date();
    yesterdayObject.setDate(yesterdayObject.getDate() - 1);
    const yesterday = getDateOnly(yesterdayObject);

    let newStreak = 1;

    if (user.lastCompletedDate === yesterday) {
      newStreak = (user.streak || 0) + 1;
    }

    const xpEarned = correctAnswers * 10;

    await dailyProgress.insertOne({
      userId,
      date: today,
      course,
      questionIds,
      correctAnswers,
      completed: true,
      completedAt: new Date(),
    });
    await users.updateOne(
      { _id: userId },
      {
        $set: {
          streak: newStreak,
          lastCompletedDate: today,
        },
        $inc: {
          xp: xpEarned,
        },
        $addToSet: {
          completedQuestionIds: {
            $each: correctQuestionIds,
          },
        },
      },
    );

    return NextResponse.json({
      message: "Daily lesson completed.",
      correctAnswers,
      xpEarned,
      streak: newStreak,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Could not save progress.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
