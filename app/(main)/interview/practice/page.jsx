import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategorySelector from "./_components/category-selector";

export default function IndustryPracticePage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Interview Prep
          </Button>
        </Link>
        <h1 className="text-6xl font-bold text-foreground mb-3">
          Industry Practice
        </h1>
        <p className="text-lg text-muted-foreground">
          Practice with general interview questions and track your progress
        </p>
      </div>

      {/* Category Selection */}
      <CategorySelector />
    </div>
  );
}
