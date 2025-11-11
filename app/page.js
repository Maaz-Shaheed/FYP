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
} from "lucide-react";
import HeroSection from "@/components/hero";

export default function LandingPage() {
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
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three powerful tools that work together to transform your job search
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Smart Resume Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Create ATS-optimized resumes tailored to each job posting with AI-powered insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cover Letter Generator</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate personalized cover letters that connect your experience to employer needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-all group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Interview Prep</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice with AI-powered interviews and job-specific questions to build confidence.
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
              { number: "10K+", label: "Users" },
              { number: "50K+", label: "Resumes" },
              { number: "95%", label: "Success Rate" },
              { number: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center border-2 border-primary/20"
              >
                <h3 className="text-4xl font-black text-foreground mb-2">{stat.number}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
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
                Ready to Transform Your Career?
              </h2>
              <p className="mx-auto max-w-2xl text-primary-foreground/90 text-lg">
                Join thousands of professionals who've already transformed their job search with CareerForge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-background text-foreground hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold"
                  >
                    Get Started Free
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
