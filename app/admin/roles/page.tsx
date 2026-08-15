'use client';

import React from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Shield,
  Briefcase,
  User,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function AdminRolesPage() {
  const permissions = [
    {
      name: 'Access Admin Management Portal',
      description: 'View executive analytics, reports, and administrative management tools',
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Assign Users to Projects',
      description: 'Allocate and manage which team members have access to each project',
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Promote / Demote User Roles',
      description: 'Change user roles between Admin, Manager, and Member',
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Create New Projects',
      description: 'Initiate new Kanban boards with default workflow lanes',
      admin: true,
      manager: true,
      member: false,
    },
    {
      name: 'Edit & Alter Project Details',
      description: 'Rename projects, update descriptions, and alter project configurations',
      admin: true,
      manager: true,
      member: false,
    },
    {
      name: 'Delete / Archive Projects',
      description: 'Soft-delete projects and remove boards from workspace',
      admin: true,
      manager: true, // For own projects
      member: false,
    },
    {
      name: 'Manage Cards & Move Workflow Lanes',
      description: 'Create tasks, drag cards across lanes, set priorities, and due dates',
      admin: true,
      manager: true,
      member: true,
    },
    {
      name: 'Post Comments & Tag Tasks',
      description: 'Collaborate with team members, add comments, and categorize with tags',
      admin: true,
      manager: true,
      member: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-border/40">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Roles & Permissions Matrix</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Reference and access control configuration defining system capabilities across all user tiers.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Admin Card */}
        <div className="rounded-xl border border-primary/40 bg-card p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">ADMIN</h2>
              <span className="text-[10px] font-semibold text-primary uppercase">Full System Authority</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Full administrative access. Governs the Admin Portal, manages user accounts, allocates members to projects, and oversees workspace reports.
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-foreground font-semibold">
            Key: User Management • Member Assignments • System Reports
          </div>
        </div>

        {/* Manager Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">MANAGER</h2>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Project Lead</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Empowered to create and manage projects, alter project details, and lead assigned workflow boards. Cannot access the global Admin Portal.
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-foreground font-semibold">
            Key: Create Projects • Edit Project Details • Manage Boards
          </div>
        </div>

        {/* Member Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">MEMBER</h2>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Team Contributor</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Standard collaborator assigned to specific projects by administrators. Can create/move cards, leave comments, and update task progress.
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-foreground font-semibold">
            Key: Work on Cards • Move Lanes • Add Comments & Tags
          </div>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border/40 px-6 py-4">
          <h2 className="text-sm font-bold text-foreground">Access Rights & Permissions Table</h2>
          <p className="text-xs text-muted-foreground">Cross-role permission breakdown enforced by backend middleware</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5 w-1/2">Capability / Operation</th>
                <th className="px-4 py-3.5 text-center">ADMIN</th>
                <th className="px-4 py-3.5 text-center">MANAGER</th>
                <th className="px-4 py-3.5 text-center">MEMBER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {permissions.map((perm, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground text-xs">{perm.name}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{perm.description}</p>
                  </td>

                  {/* Admin */}
                  <td className="px-4 py-4 text-center">
                    {perm.admin ? (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </td>

                  {/* Manager */}
                  <td className="px-4 py-4 text-center">
                    {perm.manager ? (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </td>

                  {/* Member */}
                  <td className="px-4 py-4 text-center">
                    {perm.member ? (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
