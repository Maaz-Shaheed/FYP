import { getAssessments } from "@/actions/interview";
import StatsCards from "../../_components/stats-cards";
import PerformanceChart from "../../_components/performace-chart";
import QuizList from "../../_components/quiz-list";

export default async function AssessmentLoader() {
  try {
    const assessments = await getAssessments();
    
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

