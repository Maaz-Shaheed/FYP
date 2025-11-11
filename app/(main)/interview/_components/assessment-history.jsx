import { getAssessments } from "@/actions/interview";
import StatsCards from "./stats-cards";
import PerformanceChart from "./performace-chart";
import QuizList from "./quiz-list";

export default async function AssessmentHistory() {
  try {
    const assessments = await getAssessments();
    
    if (!assessments || assessments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No quiz history yet. Complete a quiz to see your results here.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    );
  } catch (error) {
    console.error("Error loading assessments:", error);
    return (
      <div className="text-center py-8 text-muted-foreground">
        Unable to load assessment history
      </div>
    );
  }
}

