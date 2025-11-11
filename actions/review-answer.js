"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });

/**
 * Review a theory-based answer using Gemini
 * @param {string} question - The theory question
 * @param {string} answer - The user's answer
 * @param {string} jobTitle - The job title for context
 * @param {string} jobDescription - The job description for context
 * @returns {Promise<Object>} Review object with feedback
 */
export async function reviewTheoryAnswer(question, answer, jobTitle, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!question || !answer) {
    throw new Error("Question and answer are required");
  }

  const truncatedDescription = jobDescription.substring(0, 3000);

  const prompt = `
    You are an expert interview evaluator. Review this candidate's answer to an interview question.
    
    Job Title: ${jobTitle}
    Job Description (excerpt): ${truncatedDescription.substring(0, 1000)}...
    
    Interview Question:
    ${question}
    
    Candidate's Answer:
    ${answer}
    
    Provide a comprehensive review in this JSON format only, no additional text:
    {
      "score": number (0-100),
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "feedback": "string (2-3 sentences providing constructive feedback)",
      "suggestions": ["string", "string"]
    }
    
    Evaluation criteria:
    - Relevance to the question and job requirements
    - Depth of understanding demonstrated
    - Clarity and organization of response
    - Professional knowledge and insights
    - Areas that could be improved
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    // Clean up the response
    let cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^json\s*/, "")
      .trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    const review = JSON.parse(cleanedText);
    
    // Validate structure
    if (typeof review.score !== 'number' || review.score < 0 || review.score > 100) {
      review.score = 75; // Default score if invalid
    }
    
    if (!review.feedback) {
      review.feedback = "Your answer demonstrates understanding of the topic.";
    }
    
    return review;
  } catch (error) {
    console.error("Error reviewing theory answer:", error);
    
    // Return a default review if API fails
    return {
      score: 70,
      strengths: ["You provided an answer to the question"],
      weaknesses: ["Could benefit from more detail"],
      feedback: "Your answer was received. Consider providing more specific examples or detailed explanations to strengthen your response.",
      suggestions: ["Add specific examples", "Elaborate on key points"]
    };
  }
}

