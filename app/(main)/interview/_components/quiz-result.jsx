"use client";

import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl text-foreground font-bold">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h1>

      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
          <Progress value={result.quizScore} className="w-full" />
        </div>

        {/* Improvement Tip */}
        {result.improvementTip && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">Improvement Tip:</p>
            <p className="text-muted-foreground">{result.improvementTip}</p>
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>
          {result.questions.map((q, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  {q.type === "theory" && (
                    <span className="text-xs text-primary mt-1 inline-block">Theory Question</span>
                  )}
                </div>
                {q.type === "mcq" && (
                  q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )
                )}
                {q.type === "theory" && q.review && (
                  <span className="text-lg font-bold text-primary">
                    {q.review.score}/100
                  </span>
                )}
              </div>
              
              {q.type === "theory" ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Your Answer:</p>
                    <p className="bg-muted/50 p-3 rounded whitespace-pre-wrap">{q.userAnswer || "No answer provided"}</p>
                  </div>
                  {q.review ? (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="font-medium">AI Review</p>
                        <span className="text-lg font-bold text-primary">
                          Score: {q.review.score}/100
                        </span>
                      </div>
                      {q.review.strengths && q.review.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">Strengths:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {q.review.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {q.review.weaknesses && q.review.weaknesses.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-orange-600 mb-1">Areas to Improve:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {q.review.weaknesses.map((weakness, idx) => (
                              <li key={idx}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {q.review.feedback && (
                        <div>
                          <p className="text-sm font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-muted-foreground">{q.review.feedback}</p>
                        </div>
                      )}
                      {q.review.suggestions && q.review.suggestions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Suggestions:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {q.review.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Answer not reviewed
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p>Your answer: {q.userAnswer}</p>
                    {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
                  </div>
                  {q.explanation && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <p className="font-medium">Explanation:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
