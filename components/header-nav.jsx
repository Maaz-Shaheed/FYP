"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function HeaderNav() {
  const pathname = usePathname();
  
  // Determine if we're on main page or a tool page
  const isMainPage = pathname === "/";
  const isResumePage = pathname.startsWith("/resume");
  const isCoverLetterPage = pathname.startsWith("/ai-cover-letter");
  const isInterviewPage = pathname.startsWith("/interview");
  const isDashboardPage = pathname.startsWith("/dashboard");

  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      <SignedIn>
        {/* On main page: Show only logout */}
        {isMainPage && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-xl",
                userPreviewMainIdentifier: "font-semibold",
              },
            }}
            afterSignOutUrl="/"
          />
        )}

        {/* On tool pages: Show other tool buttons, hide current page button */}
        {!isMainPage && (
          <>
            {!isResumePage && (
              <Link href="/resume">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Build Resume
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <FileText className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {!isCoverLetterPage && (
              <Link href="/ai-cover-letter">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <PenBox className="h-4 w-4" />
                  Cover Letter
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <PenBox className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {!isInterviewPage && (
              <Link href="/interview">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Interview Prep
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <GraduationCap className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {!isDashboardPage && (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Industry Insights
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </>
        )}
      </SignedIn>

      <SignedOut>
        <SignInButton>
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}



