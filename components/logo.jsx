"use client";

import React from "react";

export default function Logo({ className = "", size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      
      {/* Main shape - Modern abstract design */}
      <path
        d="M30 20 L90 20 L100 60 L60 100 L20 60 Z"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      
      {/* Overlapping shape for depth */}
      <path
        d="M40 30 L80 30 L85 55 L50 85 L25 55 Z"
        fill="url(#logoGradient2)"
        opacity="0.7"
      />
      
      {/* Center accent */}
      <circle
        cx="60"
        cy="60"
        r="12"
        fill="white"
        opacity="0.9"
      />
      
      {/* Sparkle effect */}
      <circle
        cx="60"
        cy="60"
        r="6"
        fill="url(#logoGradient)"
      />
    </svg>
  );
}

export function LogoWithText({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={40} />
      <span className="gradient-title text-2xl font-black tracking-tight">
        PrepMate AI
      </span>
    </div>
  );
}

