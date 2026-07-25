import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db(process.env.MONGODB_DB);

    const questions = await db
      .collection("questions")
      .find(
        {},
        {
          projection: {
            answer: 0,
          },
        }
      )
      .sort({
        topic: 1,
        levelOrder: 1,
        order: 1,
      })
      .toArray();

    return Response.json(questions);
  } catch (error) {
    return Response.json(
      {
        message: "Could not get questions.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}