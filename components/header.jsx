import React from "react";
import Link from "next/link";
import { LogoWithText } from "@/components/logo";
import { checkUser } from "@/lib/checkUser";
import HeaderNav from "./header-nav";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b glass z-50 supports-[backdrop-filter]:glass">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <LogoWithText />
        </Link>

        {/* Action Buttons */}
        <HeaderNav />
      </nav>
    </header>
  );
}
