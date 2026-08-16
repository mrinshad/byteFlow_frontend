'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Moon,
  Sun,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const workflowSteps = [
    {
      step: '01',
      title: 'Create Projects & Lanes',
      description: 'Set up projects with custom workflow lanes like To Do, In Progress, Review, and Done.',
    },
    {
      step: '02',
      title: 'Assign Team Members',
      description: 'Add members to projects with role-based permissions. Managers and Admins control access.',
    },
    {
      step: '03',
      title: 'Track & Collaborate',
      description: 'Create tasks with priorities, comment with @mentions, and move cards across lanes in real time.',
    },
    {
      step: '04',
      title: 'Monitor Progress',
      description: 'View completion metrics, activity logs, and project insights to keep teams aligned.',
    },
  ];

  const roleCapabilities = [
    {
      role: 'Admin',
      description: 'Full system access',
      capabilities: [
        'Create & delete projects',
        'Manage all users & roles',
        'Assign members to projects',
        'Full board & card control',
        'View deleted cards & restore',
        'Access admin portal & reports',
      ],
    },
    {
      role: 'Manager',
      description: 'Project-level control',
      capabilities: [
        'Create projects',
        'Edit & manage assigned projects',
        'Create, edit & delete cards',
        'Manage lanes & tags',
        'View deleted cards & restore',
        'View project insights',
      ],
    },
    {
      role: 'Member',
      description: 'Task-level contributor',
      capabilities: [
        'View assigned projects',
        'Create & edit own cards',
        'Move cards across lanes',
        'Comment & @mention teammates',
        'Receive notifications',
        'View activity history',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="ByteFlow"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain shadow-2xs"
              priority
            />
            <span className="text-base font-bold tracking-tight">ByteFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#roles" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Roles
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated ? (
              <Link href="/projects">
                <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-xs">
                  <span>Go to Projects</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-xs font-semibold shadow-xs">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse [animation-duration:6s]" />
          <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl animate-pulse [animation-duration:8s] [animation-delay:2s]" />
          <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl animate-pulse [animation-duration:7s] [animation-delay:4s]" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-muted-foreground">Real-time project management</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.15]">
              Orchestrate Workflows.{' '}
              <span className="text-muted-foreground">Align Teams.</span>{' '}
              Ship Faster.
            </h1>

            <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
              ByteFlow is a real-time Kanban platform built for teams that need
              clarity. Manage projects with drag-and-drop boards, role-based
              governance, live notifications, and full activity audit trails.
            </p>

            <div className="mt-8 flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/projects">
                  <Button size="lg" className="gap-2 text-sm font-semibold shadow-sm px-6">
                    <span>Enter Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="gap-2 text-sm font-semibold shadow-sm px-6">
                      <span>Get Started Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-sm font-semibold px-6">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual — Kanban Preview */}
          <div className="mt-14 rounded-xl border border-border/60 bg-card/80 shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 [animation-delay:200ms]">
            <div className="border-b border-border/40 bg-muted/30 px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground ml-2">ByteFlow — Project Board</span>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lane: To Do */}
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-foreground">To Do</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">3</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Design system tokens', priority: 'HIGH', color: 'bg-orange-500' },
                    { title: 'User onboarding flow', priority: 'MEDIUM', color: 'bg-amber-500' },
                    { title: 'API rate limiting', priority: 'LOW', color: 'bg-blue-500' },
                  ].map((card) => (
                    <div key={card.title} className="rounded-md border border-border/40 bg-background p-2.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${card.color}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{card.priority}</span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground leading-snug">{card.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane: In Progress */}
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-foreground">In Progress</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">2</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Notification system', priority: 'CRITICAL', color: 'bg-red-500' },
                    { title: 'Comment @mentions', priority: 'HIGH', color: 'bg-orange-500' },
                  ].map((card) => (
                    <div key={card.title} className="rounded-md border border-border/40 bg-background p-2.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${card.color}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{card.priority}</span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground leading-snug">{card.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane: Done */}
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-foreground">Done</span>
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">2</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Authentication & RBAC', priority: 'CRITICAL', color: 'bg-red-500' },
                    { title: 'Project CRUD & members', priority: 'HIGH', color: 'bg-orange-500' },
                  ].map((card) => (
                    <div key={card.title} className="rounded-md border border-border/40 bg-background p-2.5 shadow-2xs opacity-70">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground line-through">{card.priority}</span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground/70 leading-snug line-through">{card.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative border-t border-border/30">
        {/* Background accent */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Workflow</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How ByteFlow works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="rounded-xl border border-border/50 bg-card/60 p-5 h-full transition-colors hover:bg-card/90 hover:border-border">
                  <span className="text-3xl font-black text-muted-foreground/20 leading-none">{item.step}</span>
                  <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Capabilities */}
      <section id="roles" className="relative border-t border-border/30 bg-muted/10">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl animate-pulse [animation-duration:9s]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Permissions</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Role-based governance
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Every team member has the right level of access. No more, no less.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {roleCapabilities.map((role) => (
              <div
                key={role.role}
                className="rounded-xl border border-border/50 bg-card/60 p-5 transition-colors hover:bg-card/90 hover:border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{role.role}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border/30">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to streamline your workflow?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Start organizing projects, assigning tasks, and collaborating with your team in real time.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link href="/projects">
                <Button size="lg" className="gap-2 text-sm font-semibold shadow-sm px-6">
                  <span>Enter Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-sm font-semibold shadow-sm px-6">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-sm font-semibold px-6">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ByteFlow"
              width={24}
              height={24}
              className="h-6 w-6 rounded-md object-contain shadow-2xs"
            />
            <span className="text-xs font-semibold text-foreground">ByteFlow</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} ByteFlow. Built for teams that ship.
          </p>
        </div>
      </footer>
    </div>
  );
}
