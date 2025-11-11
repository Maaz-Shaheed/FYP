import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Upload, 
  ArrowRight, 
  Briefcase, 
  Target,
  FileText,
  BrainCircuit,
  CheckCircle2,
  Zap
} from "lucide-react";
import AssessmentHistory from "./_components/assessment-history";

export default function InterviewPrepPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-foreground mb-3">
          Interview Preparation
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose your preparation method based on your needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job-Based Interview Prep */}
        <Card className="glass border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-xl group">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">Job-Based Prep</CardTitle>
                <CardDescription className="text-base">
                  Prepare for specific job applications with role-specific questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm font-medium mb-3 text-foreground">Perfect for:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Preparing for specific job applications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Role-specific technical questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Company-specific preparation
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Upload Job Postings</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a CSV file with job listings you're interested in
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Select a Job</p>
                  <p className="text-xs text-muted-foreground">
                    Choose which role you want to practice for
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Take the Quiz</p>
                  <p className="text-xs text-muted-foreground">
                    2 theory questions + 3 MCQs tailored to the job description
                  </p>
                </div>
              </div>
            </div>

            <Link href="/interview/jobs" className="block">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-bold group/btn">
                Start Job-Based Prep
                <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Industry Interview Prep */}
        <Card className="glass border-2 border-secondary/30 hover:border-secondary/50 transition-all hover:shadow-xl group">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">Industry Practice</CardTitle>
                <CardDescription className="text-base">
                  Practice with general industry questions and track your progress
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/10 p-4 rounded-lg">
              <p className="text-sm font-medium mb-3 text-foreground">Perfect for:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  General interview preparation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Skill assessment and tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Building interview confidence
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-secondary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Select Category</p>
                  <p className="text-xs text-muted-foreground">
                    Choose Technical or Behavioral questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-secondary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Answer Questions</p>
                  <p className="text-xs text-muted-foreground">
                    Practice with 5 multiple-choice questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-secondary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">View Results</p>
                  <p className="text-xs text-muted-foreground">
                    Get your score and track progress over time
                  </p>
                </div>
              </div>
            </div>

            <Link href="/interview/practice" className="block">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base font-bold group/btn">
                Start Industry Practice
                <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Comparison */}
      <Card className="glass border-2 border-muted mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Not sure which to choose?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Choose <span className="text-primary">Job-Based Prep</span> if:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>You're actively applying to specific jobs</li>
                <li>You want questions tailored to a job description</li>
                <li>You need practice for role-specific scenarios</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Choose <span className="text-secondary">Industry Practice</span> if:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>You want general interview practice</li>
                <li>You're building overall interview skills</li>
                <li>You want to track progress over time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6">Your Quiz History</h2>
        <AssessmentHistory />
      </div>
    </div>
  );
}
