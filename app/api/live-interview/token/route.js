import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// This endpoint provides the API key for client-side OpenAI Realtime API usage
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    // Get model from environment variable, fallback to default
    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-mini";
    
    // Get interview time limit from environment variable (in seconds), default to 30
    const interviewTimeLimit = parseInt(process.env.INTERVIEW_TIME_LIMIT_SECONDS || "30", 10);
    
    // Get voice model from environment variable, default to "cedar"
    const voice = process.env.OPENAI_REALTIME_VOICE || "cedar";

    // Return the API key for client-side usage
    // Note: In production, you should implement ephemeral token generation for better security
    return NextResponse.json({ 
      apiKey: apiKey,
      model: model,
      interviewTimeLimit: interviewTimeLimit,
      voice: voice
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

