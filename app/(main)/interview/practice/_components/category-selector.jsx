"use client";

import { useState } from "react";
import { Target, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Quiz from "../../_components/quiz";

export default function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    return (
      <Quiz 
        category={selectedCategory} 
        onBack={() => setSelectedCategory(null)} 
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card 
        className="glass border-2 border-secondary/30 hover:border-secondary/50 transition-all hover:shadow-xl cursor-pointer group"
        onClick={() => setSelectedCategory("Technical")}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Technical</CardTitle>
              <CardDescription>
                Industry-specific technical questions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Test your knowledge with questions tailored to your industry and skills.
          </p>
        </CardContent>
      </Card>

      <Card 
        className="glass border-2 border-accent/30 hover:border-accent/50 transition-all hover:shadow-xl cursor-pointer group"
        onClick={() => setSelectedCategory("Behavioral")}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl">Behavioral</CardTitle>
              <CardDescription>
                Situational and behavioral interview questions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Practice answering common behavioral and situational interview questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

