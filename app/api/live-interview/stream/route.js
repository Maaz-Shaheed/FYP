import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, jobTitle, jobCompany, jobDescription } = await request.json();

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build conversation history from messages
    const conversationHistory = messages
      .filter(msg => msg.text && msg.text.trim())
      .map(msg => ({
        role: msg.speaker === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    // System instruction
    const systemMessage = {
      role: "system",
      content: `You are conducting a live interview for the position of ${jobTitle} at ${jobCompany}. 

CRITICAL RULES:
1. Ask EXACTLY 5 interview questions - count them carefully
2. After asking a question, STOP TALKING and WAIT for the candidate to respond
3. DO NOT continue speaking after asking a question until the candidate provides an answer
4. DO NOT answer your own questions
5. DO NOT ask follow-up questions until the candidate has finished answering
6. After the candidate answers, provide brief positive feedback (1-2 sentences), then ask the next question
7. Keep questions concise and conversational (2-3 sentences max per turn)
8. Wait for complete silence or a clear response before speaking again

Job description: ${jobDescription.substring(0, 2000)}`
    };

    // Determine the message to send
    let userMessage;
    if (messages.length === 0) {
      // First message - start interview
      userMessage = "Hello, I'm ready to begin the interview. Please start with the first question.";
    } else {
      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(m => m.speaker === "user");
      userMessage = lastUserMessage?.text || messages[messages.length - 1].text;
    }

    // Build messages array for OpenAI
    const openaiMessages = [
      systemMessage,
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    // Get streaming response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in streaming interview:", error);
    return NextResponse.json(
      { error: "Failed to generate interview response" },
      { status: 500 }
    );
  }
}

