"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Mic, ArrowRight, ArrowLeft } from "lucide-react";
import JobQuiz from "./job-quiz";
import LiveInterview from "./live-interview";

export default function ModeSelector({ job }) {
  const [selectedMode, setSelectedMode] = useState(null);

  if (selectedMode === "traditional") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMode(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Mode Selection
        </Button>
        <JobQuiz job={job} />
      </div>
    );
  }

  if (selectedMode === "live") {
    return <LiveInterview job={job} onBack={() => setSelectedMode(null)} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Traditional Quiz Mode */}
      <Card className="glass border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer group relative">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">Traditional Quiz</CardTitle>
              <CardDescription>
                Answer questions at your own pace
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>2 theory questions + 3 MCQs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>AI-powered answer review</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Voice input support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Detailed feedback and scores</span>
            </li>
          </ul>
          <Button
            onClick={() => setSelectedMode("traditional")}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Traditional Quiz
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Live Bot Interview Mode */}
      <Card className="glass border-2 border-secondary/30 hover:border-secondary/50 transition-all hover:shadow-xl cursor-pointer group relative">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">Live Bot Interview</CardTitle>
              <CardDescription>
                Real-time conversational interview with AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Natural conversation flow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Live transcriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Auto-ends after 5 questions or 30 seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Instant feedback and scoring</span>
            </li>
          </ul>
          <Button
            onClick={() => setSelectedMode("live")}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            Start Live Interview
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

