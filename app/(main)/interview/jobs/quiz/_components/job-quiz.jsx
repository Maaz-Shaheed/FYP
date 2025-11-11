"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QuizResult from "../../../_components/quiz-result";
import { BarLoader } from "react-spinners";
import { generateJobBasedQuiz, saveJobQuizResult } from "@/actions/job-quiz";
import { reviewTheoryAnswer } from "@/actions/review-answer";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function JobQuiz({ job }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [theoryReviews, setTheoryReviews] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [reviewingAnswer, setReviewingAnswer] = useState(false);
  
  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      setTheoryReviews(new Array(quizData.length).fill(null));
    }
    
    // Cleanup speech recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [quizData]);

  const initializeSpeechRecognition = () => {
    if (!speechSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const currentAnswer = answers[currentQuestion] || "";
      const newAnswer = currentAnswer + finalTranscript + interimTranscript;
      handleAnswer(newAnswer.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        // Don't show error for no speech, just stop
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const startListening = () => {
    if (!speechSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    try {
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        toast.success("Listening... Speak your answer");
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start speech recognition");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success("Stopped listening");
    }
  };

  const handleStartQuiz = async () => {
    setGeneratingQuiz(true);
    setResultData(null);
    setQuizData(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setTheoryReviews([]);

    try {
      const questions = await generateJobBasedQuiz(
        job.description,
        job.title,
        job.company
      );
      setQuizData(questions);
      toast.success("Quiz generated successfully!");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error.message || "Failed to generate quiz questions");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };


  const handleNext = async () => {
    const currentQ = quizData[currentQuestion];
    
    // Validate theory question has an answer
    if (currentQ.type === "theory") {
      if (!answers[currentQuestion] || !answers[currentQuestion].trim()) {
        toast.error("Please provide an answer before proceeding");
        return;
      }
    }

    if (currentQuestion < quizData.length - 1) {
      // Stop listening if active
      if (isListening) {
        stopListening();
      }
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };


  const finishQuiz = async () => {
    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    // Review all theory questions
    setReviewingAnswer(true);
    toast.info("Reviewing your answers with AI...");
    
    // Initialize reviews array with null for all questions
    const newReviews = new Array(quizData.length).fill(null);
    
    try {
      // Find all theory questions and review them
      const theoryQuestionIndices = [];
      for (let i = 0; i < quizData.length; i++) {
        if (quizData[i].type === "theory") {
          theoryQuestionIndices.push(i);
        }
      }

      console.log(`Found ${theoryQuestionIndices.length} theory questions to review`);

      // Review all theory questions sequentially
      for (const index of theoryQuestionIndices) {
        const answer = answers[index];
        if (answer && answer.trim()) {
          try {
            console.log(`Reviewing theory question ${index + 1}...`, {
              question: quizData[index].question.substring(0, 50),
              answerLength: answer.length
            });
            const review = await reviewTheoryAnswer(
              quizData[index].question,
              answer,
              job.title,
              job.description
            );
            newReviews[index] = review;
            console.log(`Review completed for question ${index + 1}:`, {
              score: review.score,
              hasFeedback: !!review.feedback
            });
          } catch (error) {
            console.error(`Error reviewing question ${index + 1}:`, error);
            toast.error(`Could not review question ${index + 1}. Continuing...`);
            // Store null to indicate review failed
            newReviews[index] = null;
          }
        } else {
          console.log(`Skipping question ${index + 1} - no answer provided`);
          newReviews[index] = null;
        }
      }
      
      console.log("All reviews completed:", newReviews);
      
      // Update state
      setTheoryReviews(newReviews);
      
      // Calculate score using the new reviews
      const mcqCorrect = quizData.filter((q, idx) => 
        q.type === "mcq" && answers[idx] === q.correctAnswer
      ).length;
      const mcqTotal = quizData.filter(q => q.type === "mcq").length;
      
      // Get scores from reviewed theory questions
      const theoryScores = [];
      for (const index of theoryQuestionIndices) {
        if (newReviews[index] && newReviews[index].score !== undefined) {
          theoryScores.push(newReviews[index].score);
        }
      }
      const theoryTotal = theoryQuestionIndices.length;
      
      const mcqPercentage = mcqTotal > 0 ? (mcqCorrect / mcqTotal) * 100 : 0;
      const theoryAverage = theoryScores.length > 0
        ? theoryScores.reduce((sum, score) => sum + score, 0) / theoryScores.length
        : 0;
      
      const score = (mcqPercentage * 0.6) + (theoryAverage * 0.4);
      
      console.log("Score calculation:", {
        mcqCorrect,
        mcqTotal,
        mcqPercentage,
        theoryScores,
        theoryAverage,
        finalScore: score
      });
      
      // Build question results using newReviews directly (not state)
      const questionResults = quizData.map((q, index) => {
        if (q.type === "theory") {
          return {
            question: q.question,
            type: "theory",
            userAnswer: answers[index] || "No answer provided",
            review: newReviews[index] || null,
          };
        } else {
          return {
            question: q.question,
            type: "mcq",
            answer: q.correctAnswer,
            userAnswer: answers[index],
            isCorrect: q.correctAnswer === answers[index],
            explanation: q.explanation,
          };
        }
      });
      
      console.log("Question results:", questionResults.map(q => ({
        type: q.type,
        hasReview: !!q.review,
        reviewScore: q.review?.score
      })));

      // Save results to database - Always attempt to save, even if some reviews failed
      let savedAssessment = null;
      try {
        console.log("Saving quiz results to database...", {
          questionCount: questionResults.length,
          score,
          jobTitle: job.title,
          jobCompany: job.company
        });
        savedAssessment = await saveJobQuizResult(questionResults, score, job.title, job.company);
        console.log("Results saved successfully:", savedAssessment?.id);
        toast.success("Results saved to your history!");
      } catch (error) {
        console.error("Error saving results to database:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
        toast.error(`Quiz completed but failed to save results: ${error.message}`);
      }

      const result = {
        quizScore: score,
        questions: questionResults,
        improvementTip: savedAssessment?.improvementTip || null,
      };

      setResultData(result);
      toast.success("Quiz completed! All answers have been reviewed.");
    } catch (error) {
      console.error("Error finishing quiz:", error);
      toast.error("Error completing quiz. Please try again.");
    } finally {
      setReviewingAnswer(false);
    }
  };

  const startNewQuiz = () => {
    if (isListening) {
      stopListening();
    }
    setCurrentQuestion(0);
    setAnswers([]);
    setTheoryReviews([]);
    setShowExplanation(false);
    setQuizData(null);
    setResultData(null);
    handleStartQuiz();
  };

  if (generatingQuiz) {
    return (
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <BarLoader width={"100%"} color="#a855f7" />
            <p className="text-muted-foreground">
              Generating 2 theory questions and 3 multiple-choice questions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="glass border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Ready to prepare for this role?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We'll generate 2 theory-based questions and 3 multiple-choice questions 
            specifically tailored to this job description.
            These questions will help you prepare for interviews at <strong>{job.company}</strong> for
            the <strong>{job.title}</strong> role.
          </p>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">This quiz will include:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>2 open-ended theory questions (with AI review)</li>
              <li>3 multiple-choice questions</li>
              <li>Voice input support for theory questions</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Generate & Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];
  const isTheoryQuestion = question.type === "theory";
  const currentAnswer = answers[currentQuestion] || "";

  return (
    <Card className="glass border-2 border-primary/20">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
          {isTheoryQuestion && (
            <span className="ml-2 text-sm font-normal text-primary">(Theory Question)</span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Preparing for: <strong>{job.title}</strong> at <strong>{job.company}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        
        {isTheoryQuestion ? (
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here, or use the microphone button to speak your answer..."
                className="min-h-[200px] pr-12"
              />
              {speechSupported && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className="h-8 w-8 p-0"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Listening... Speak your answer</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <RadioGroup
              onValueChange={handleAnswer}
              value={currentAnswer}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-primary/30 transition-colors"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {showExplanation && currentAnswer === question.correctAnswer && (
              <div className="mt-4 p-4 bg-muted rounded-lg border border-primary/20">
                <p className="font-medium mb-2">Explanation:</p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {!isTheoryQuestion && !showExplanation && currentAnswer && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!currentAnswer || (isTheoryQuestion && !currentAnswer.trim()) || reviewingAnswer}
          className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {reviewingAnswer ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Reviewing...
            </>
          ) : (
            currentQuestion < quizData.length - 1
              ? "Next Question"
              : "Finish Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
