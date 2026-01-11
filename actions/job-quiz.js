"use server";

import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/prisma";

const openai = new OpenAI();
const modelName = process.env.OPENAI_MODEL || "gpt-5-nano";

/**
 * Generate 5 MCQs based on a job description
 * @param {string} jobDescription - The job description text
 * @param {string} jobTitle - The job title
 * @param {string} companyName - The company name
 * @returns {Promise<Array>} Array of 5 question objects
 */
export async function generateJobBasedQuiz(jobDescription, jobTitle, companyName) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!jobDescription || !jobTitle) {
    throw new Error("Job description and title are required");
  }

  // Truncate job description if too long (keep first 4000 characters for API efficiency)
  const truncatedDescription = jobDescription.substring(0, 4000);

  const prompt = `
    Generate 5 interview questions based on this job posting:
    
    Job Title: ${jobTitle}
    Company: ${companyName || "Not specified"}
    
    Job Description:
    ${truncatedDescription}
    
    Generate:
    1. TWO theory-based, open-ended questions that require detailed written responses
    2. THREE multiple-choice questions
    
    For theory questions:
    - Should require explanation, demonstration of knowledge, or scenario-based responses
    - Should be directly related to job requirements, skills, or responsibilities
    - Should not have a single "correct" answer, but should test understanding
    
    For MCQ questions:
    - Each should have 4 answer options
    - Include a clear correct answer
    - Include an explanation for the correct answer
    
    Return the response in this JSON format only, no additional text:
    {
      "theoryQuestions": [
        {
          "question": "string",
          "type": "theory"
        }
      ],
      "mcqQuestions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string",
          "type": "mcq"
        }
      ]
    }
  `;

  try {
    const response = await openai.responses.create({
      model: modelName,
      input: prompt
    });
    const text = response.output_text;

    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    // Clean up the response - remove markdown code blocks if present
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
    
    let quiz;
    try {
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Response text:", text);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    // Validate structure
    if (!quiz.theoryQuestions || !Array.isArray(quiz.theoryQuestions)) {
      throw new Error("Invalid response format: missing theory questions");
    }
    
    if (!quiz.mcqQuestions || !Array.isArray(quiz.mcqQuestions)) {
      throw new Error("Invalid response format: missing MCQ questions");
    }
    
    // Ensure we have exactly 2 theory and 3 MCQs
    if (quiz.theoryQuestions.length !== 2) {
      console.warn(`Expected 2 theory questions but received ${quiz.theoryQuestions.length}`);
      if (quiz.theoryQuestions.length === 0) {
        throw new Error("No theory questions generated. Please try again.");
      }
    }
    
    if (quiz.mcqQuestions.length !== 3) {
      console.warn(`Expected 3 MCQ questions but received ${quiz.mcqQuestions.length}`);
      if (quiz.mcqQuestions.length === 0) {
        throw new Error("No MCQ questions generated. Please try again.");
      }
    }

    // Add type markers and combine questions
    const theoryQuestions = quiz.theoryQuestions.map(q => ({ ...q, type: "theory" }));
    const mcqQuestions = quiz.mcqQuestions.map(q => ({ ...q, type: "mcq" }));
    
    // Return combined: 2 theory first, then 3 MCQs
    return [...theoryQuestions, ...mcqQuestions];
  } catch (error) {
    console.error("Error generating job-based quiz:", error);
    
    // Return more specific error messages
    if (error.message.includes("API key")) {
      throw new Error("API configuration error. Please check your OpenAI API key.");
    }
    
    if (error.message.includes("parse") || error.message.includes("JSON")) {
      throw new Error("Error processing AI response. Please try again.");
    }
    
    // Return the original error message if it's already user-friendly
    if (error.message && !error.message.includes("Error generating")) {
      throw error;
    }
    
    throw new Error(error.message || "Failed to generate quiz questions. Please try again.");
  }
}

/**
 * Save live interview results to the assessment table
 * @param {Array} transcript - Array of conversation entries (user + bot)
 * @param {number} questionCount - Number of questions asked
 * @param {string} jobTitle - Job title for context
 * @param {string} jobCompany - Company name for context
 * @param {string} jobDescription - Job description for analysis
 * @returns {Promise<Object>} Result with score and analysis
 */
export async function saveLiveInterviewResult(transcript, questionCount, jobTitle, jobCompany, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Format transcript for analysis
    const conversationText = transcript
      .map(entry => `${entry.speaker === "bot" ? "Interviewer" : "Candidate"}: ${entry.text}`)
      .join("\n\n");

    // Generate comprehensive analysis using Gemini - NO FALLBACKS
    // Include full transcript for accurate analysis
    const fullTranscript = transcript
      .map((entry, index) => {
        const timestamp = entry.timestamp 
          ? new Date(entry.timestamp).toLocaleTimeString() 
          : `[${index + 1}]`;
        return `[${timestamp}] ${entry.speaker === "bot" ? "Interviewer" : "Candidate"}: ${entry.text}`;
      })
      .join("\n\n");

    const analysisPrompt = `
You are an interview coach analyzing a practice interview. Be FAIR, REALISTIC, and HONEST.

POSITION: ${jobTitle} at ${jobCompany}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

INTERVIEW TRANSCRIPT:
${fullTranscript}

METADATA:
- Questions asked: ${questionCount}
- Conversation turns: ${transcript.length}

SCORING GUIDELINES (Be REALISTIC - this simulates a real job interview!):
- 80-100: Excellent - strong answers, demonstrates required skills and experience
- 60-79: Good - some gaps but shows competence and potential
- 40-59: Fair - basic understanding but significant room for improvement
- 20-39: Poor - lacks fundamental knowledge or skills for the role
- Below 20: Very Poor - zero relevant knowledge, not qualified for the position

CRITICAL SCORING RULES:
1. If candidate repeatedly says "I don't know", "no experience", or gives zero-effort answers: score 20-35%
2. If candidate shows NONE of the required skills from the job description: score 20-40%
3. If candidate gives vague, non-specific answers: score 30-50%
4. Only give 50+ if candidate demonstrates SOME relevant knowledge or transferrable skills
5. Only give 70+ if candidate clearly has the required experience

This is a PRACTICE interview but the purpose is to assess READINESS. Giving high scores for unqualified candidates is misleading and unhelpful.

Return JSON (ONLY valid JSON, no markdown):
{
  "overallScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "responseQuality": <number 0-100>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["area for improvement 1", "area for improvement 2"],
  "improvementTip": "One specific, actionable thing to practice (2 sentences max)",
  "feedback": "Brief summary of performance (2-3 sentences, honest and constructive tone)",
  "questionAnalysis": [
    {"question": "first question text or 'Question 1'", "answer": "candidate's answer summary", "score": 0-100, "feedback": "specific feedback on this answer"}
  ]
}
    `.trim();

    // Generate analysis using OpenAI
    let analysis;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const result = await openai.responses.create({
          model: modelName,
          input: analysisPrompt
        });
        const text = result.output_text;

        // Clean up response - remove markdown code blocks
        let cleanedText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/^json\s*/i, "")
          .trim();
        
        // Extract JSON from response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }
        
        analysis = JSON.parse(cleanedText);
        
        // Validate required fields
        if (!analysis.overallScore || !analysis.communicationScore || !analysis.feedback) {
          throw new Error("Incomplete analysis response");
        }
        
        // Success - break out of retry loop
        break;
      } catch (error) {
        retries++;
        console.error(`Error generating analysis (attempt ${retries}/${maxRetries}):`, error);
        
        if (retries >= maxRetries) {
          // After all retries failed, throw error - NO FALLBACK
          throw new Error(`Failed to generate interview analysis after ${maxRetries} attempts: ${error.message}. Please try again.`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    // Format questions for database storage - include full analysis
    const formattedQuestions = [{
      type: "live-interview",
      transcript: transcript,
      questionCount: questionCount,
      analysis: {
        overallScore: analysis.overallScore,
        communicationScore: analysis.communicationScore,
        technicalScore: analysis.technicalScore,
        responseQuality: analysis.responseQuality,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        feedback: analysis.feedback,
        questionAnalysis: analysis.questionAnalysis || []
      }
    }];

    // Save to database
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: analysis.overallScore,
        questions: formattedQuestions,
        category: `Live Interview: ${jobTitle} at ${jobCompany}`,
        improvementTip: analysis.improvementTip,
      },
    });

    console.log("Live interview assessment saved:", assessment.id);

    // Return formatted result for display - include full analysis
    return {
      quizScore: analysis.overallScore,
      questions: [{
        type: "live-interview",
        transcript: transcript,
        analysis: {
          overallScore: analysis.overallScore,
          communicationScore: analysis.communicationScore,
          technicalScore: analysis.technicalScore,
          responseQuality: analysis.responseQuality,
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          feedback: analysis.feedback,
          questionAnalysis: analysis.questionAnalysis || []
        },
        questionCount: questionCount
      }],
      improvementTip: analysis.improvementTip,
    };
  } catch (error) {
    console.error("Error saving live interview result:", error);
    throw new Error(`Failed to save interview result: ${error.message}`);
  }
}

/**
 * Save job-based quiz results to the assessment table
 * @param {Array} questionResults - Array of question results (theory + MCQ)
 * @param {number} score - Overall quiz score
 * @param {string} jobTitle - Job title for context
 * @param {string} jobCompany - Company name for context
 * @returns {Promise<Object>} Saved assessment
 */
export async function saveJobQuizResult(questionResults, score, jobTitle, jobCompany) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Generate improvement tip based on theory reviews and MCQ performance
    let improvementTip = null;
    
    const theoryQuestions = questionResults.filter(q => q.type === "theory" && q.review);
    const mcqQuestions = questionResults.filter(q => q.type === "mcq");
    
    const lowTheoryScores = theoryQuestions.filter(q => q.review && q.review.score < 70);
    const wrongMcqs = mcqQuestions.filter(q => !q.isCorrect);

    if (lowTheoryScores.length > 0 || wrongMcqs.length > 0) {
      const prompt = `
        The user completed a job-based interview quiz for ${jobTitle} at ${jobCompany}.
        
        Theory Questions Performance:
        ${theoryQuestions.map((q, i) => 
          `Question ${i + 1}: Score ${q.review?.score || 0}/100\nFeedback: ${q.review?.feedback || "N/A"}`
        ).join("\n\n")}
        
        MCQ Questions:
        ${wrongMcqs.map((q, i) => 
          `Question: "${q.question}"\nUser Answer: "${q.userAnswer}"\nCorrect Answer: "${q.answer}"`
        ).join("\n\n")}
        
        Provide a concise, encouraging improvement tip (2-3 sentences) focusing on areas to strengthen for similar interviews.
        Don't explicitly mention scores, just focus on what to practice or learn.
      `;

      try {
        const tipResponse = await openai.responses.create({
          model: modelName,
          input: prompt
        });
        improvementTip = tipResponse.output_text.trim();
      } catch (error) {
        console.error("Error generating improvement tip:", error);
        // Continue without tip if generation fails
      }
    }

    // Format questions for storage (include all data as JSON)
    const formattedQuestions = questionResults.map(q => {
      if (q.type === "theory") {
        return {
          question: q.question,
          type: "theory",
          userAnswer: q.userAnswer,
          review: q.review ? {
            score: q.review.score,
            strengths: q.review.strengths,
            weaknesses: q.review.weaknesses,
            feedback: q.review.feedback,
            suggestions: q.review.suggestions,
          } : null,
        };
      } else {
        return {
          question: q.question,
          type: "mcq",
          answer: q.answer,
          userAnswer: q.userAnswer,
          isCorrect: q.isCorrect,
          explanation: q.explanation,
        };
      }
    });

    console.log("Creating assessment record...", {
      userId: user.id,
      quizScore: score,
      questionCount: formattedQuestions.length,
      category: `Job-Based: ${jobTitle} at ${jobCompany}`
    });

    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: formattedQuestions,
        category: `Job-Based: ${jobTitle} at ${jobCompany}`,
        improvementTip,
      },
    });

    console.log("Assessment created successfully:", assessment.id);
    return assessment;
  } catch (error) {
    console.error("Error saving job quiz result:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    throw new Error(`Failed to save quiz result: ${error.message}`);
  }
}

