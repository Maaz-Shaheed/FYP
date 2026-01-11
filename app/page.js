import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  BrainCircuit,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Rocket,
  TrendingUp,
} from "lucide-react";
import HeroSection from "@/components/hero";
import { currentUser } from "@clerk/nextjs/server";

async function LandingPageContent() {
  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section - Simplified */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                All your career tools in one place
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                PrepMate AI gives you simple, AI-powered tools to move from searching to getting hired.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Resume Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    Build clear, ATS-friendly resumes that highlight your skills and projects for each role.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Application Writer</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn your experience into short, clear cover letters tailored to each job description.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Interview Studio</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice AI-powered mock interviews and get guidance on skills, roles, and next steps.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Simplified */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: "Students", label: "Career-ready preparation with structured guidance for internships, resumes, and entry-level roles." },
              { number: "Fresh Graduates", label: "Convert academics, projects, and internships into compelling, industry-aligned applications." },
              { number: "Job Seekers", label: "Navigate career transitions with intelligent resume optimization and interview preparation." },
              { number: "Global Professionals", label: "Create internationally competitive resumes and prepare for global and remote opportunities." },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-left border-2 border-primary/20"
              >
                <h3 className="text-2xl font-bold text-foreground mb-3">{stat.number}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="w-full py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl shadow-2xl relative overflow-hidden p-12 md:p-16">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="flex flex-col items-center justify-center space-y-6 text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary-foreground">
                Ready to start with PrepMate AI?
              </h2>
              <p className="mx-auto max-w-2xl text-primary-foreground/90 text-lg">
                Join students and job seekers using PrepMate AI to prepare smarter, apply with confidence, and move closer to the role they want.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-background text-foreground hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold"
                  >
                    Generate Cover Letter →
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  <span className="text-sm text-primary-foreground/90">No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-foreground" />
                  <span className="text-sm text-primary-foreground/90">Set up in 2 Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function DashboardContent({ firstName }) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Hi {firstName} 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Hope you're doing great today.
            <br />
            Let's push your career forward with PrepMate AI.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Lab</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Craft, refine, and optimize your resume for real recruiters and ATS systems.
              </p>
              <Link href="/resume">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Work on My Resume →
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cover Letter Studio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate focused, role-specific cover letters that actually get read.
              </p>
              <Link href="/ai-cover-letter">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Create Cover Letter →
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interview Arena</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Practice interviews, improve answers, and build confidence step by step.
              </p>
              <Link href="/interview">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Start Interview Prep →
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Insights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Understand roles, required skills, and market demand before you apply.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Explore Insights →
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const user = await currentUser();
  
  if (user) {
    const firstName = user.firstName || "there";
    return <DashboardContent firstName={firstName} />;
  }

  return <LandingPageContent />;
}
