import React from "react";
import { Link } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold">
                  A
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  AppointEase
                </span>
              </a>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
            </Link>
            <Link href="/services">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Services
              </a>
            </Link>
            <Link href="/instructions/domain-setup">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Domain Setup
              </a>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 bg-muted/40">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AppointEase. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/privacy">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
              </Link>
              <Link href="/terms">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
              </Link>
              <Link href="/contact">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}