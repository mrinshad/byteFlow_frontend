'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

interface PortalSwitchButtonProps {
  className?: string;
}

export function PortalSwitchButton({ className = '' }: PortalSwitchButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated || !user) return null;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return null;

  const isAdminPortal = pathname.startsWith('/admin');
  const targetHref = isAdminPortal ? '/projects' : '/admin';
  const label = isAdminPortal ? 'Kanban Boards' : 'Admin Portal';
  const Icon = isAdminPortal ? LayoutGrid : ShieldCheck;

  return (
    <Link href={targetHref} className={`hidden sm:inline-flex ${className}`}>
      <Button
        size="sm"
        variant="outline"
        title={`Switch to ${label}`}
        aria-label={`Switch to ${label}`}
        className="gap-1.5 text-xs font-semibold border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-2xs"
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
        <ArrowRight className="h-3 w-3 ml-0.5" />
      </Button>
    </Link>
  );
}
