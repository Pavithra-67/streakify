import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;  //await => Wait until MongoDB finishes connecting

    await client.db("admin").command({ ping: 1 });

    return Response.json({
      message: "MongoDB is connected!",
    });
  } catch (error) {
    return Response.json(
      {
        message: "MongoDB connection failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}