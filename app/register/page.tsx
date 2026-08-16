'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Users, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check registration status (10-user workspace limit)
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['auth', 'registration-status'],
    queryFn: () => api.auth.getRegistrationStatus(),
  });

  const registrationStatus = statusData?.data;
  const isLimitReached = registrationStatus && !registrationStatus.isRegistrationAllowed;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/projects');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, username, password);
      router.replace('/projects');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || statusLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src="/logo.png"
              alt="ByteFlow"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain shadow-2xs"
              priority
            />
            <span className="text-base font-bold tracking-tight">ByteFlow</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        {isLimitReached ? (
          /* User Limit Reached Notice */
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
              <Users className="h-6 w-6" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground">
              User Limit Reached
            </h1>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This ByteFlow workspace has reached its maximum capacity of {registrationStatus.maxUsers} users. New self-registrations are currently paused.
            </p>

            <div className="mt-6 rounded-xl border border-border/40 bg-muted/30 p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>Contact Us to Request Access</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                To request an invitation, add user seats, or upgrade workspace access, please reach out to our team via email:
              </p>
              <a
                href={`mailto:${registrationStatus.supportEmail || 'bytensolution@gmail.com'}?subject=ByteFlow%20User%20Access%20Request`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
              >
                <span>{registrationStatus.supportEmail || 'bytensolution@gmail.com'}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <a
                href={`mailto:${registrationStatus.supportEmail || 'bytensolution@gmail.com'}?subject=ByteFlow%20User%20Access%20Request`}
                className="flex-1"
              >
                <Button className="w-full gap-1.5 text-xs font-semibold shadow-xs">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Us</span>
                </Button>
              </a>
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 pb-6">
              <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-xs text-muted-foreground">Get started with ByteFlow</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  autoFocus
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10 h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full text-xs font-semibold shadow-xs" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
