"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Rocket, 
  ArrowRight 
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full min-h-[90vh] flex items-center justify-center relative overflow-hidden pt-24 pb-16">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <div className="space-y-6 mb-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.1] tracking-tight">
              Prepare Smarter. 
              <br />
              <span className="inline-block mt-2">Get Hired Faster.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              PrepMate AI helps you build ATS-friendly resumes, generate smart cover letters, and practice AI-powered mock interviews — all in one place.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold group"
              >
                Build My Resume →
                <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/interview">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-2 glass hover:bg-accent/50 font-semibold"
              >
                Start Interview Prep →
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
