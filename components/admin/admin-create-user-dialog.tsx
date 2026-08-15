'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, Eye, EyeOff, ShieldCheck, Briefcase, User } from 'lucide-react';
import { api, type Role } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminCreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCreateUserDialog({
  open,
  onOpenChange,
}: AdminCreateUserDialogProps) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('MEMBER');
    setError('');
    setShowPassword(false);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Protection check
    if (role === 'SUPER_ADMIN') {
      setError('Cannot create Super Administrator accounts');
      return;
    }

    if (role === 'ADMIN' && !isSuperAdmin) {
      setError('Only Super Administrator can create Administrator accounts');
      return;
    }

    setLoading(true);
    try {
      const res = await api.admin.createUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password,
        role,
      });

      toast.success(res.message || `User @${res.data.username} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      handleClose(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>Create New User</span>
          </DialogTitle>
          <DialogDescription>
            Register a new workspace member with allocated system permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Full Name
            </label>
            <Input
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Username
            </label>
            <Input
              placeholder="e.g. sarah_connor"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              required
              className="h-9 font-mono text-xs"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Temporary Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 pr-9 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Permission Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {isSuperAdmin && (
                <option value="ADMIN">ADMIN (Workspace Administrator)</option>
              )}
              <option value="MANAGER">MANAGER (Project Lead)</option>
              <option value="MEMBER">MEMBER (Team Contributor)</option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              {role === 'ADMIN'
                ? 'Full workspace management. Can assign members and oversee projects.'
                : role === 'MANAGER'
                ? 'Can create projects, lead assigned boards, and alter tasks.'
                : 'Can contribute to assigned project boards, move cards, and comment.'}
            </p>
          </div>

          <DialogFooter className="mt-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
