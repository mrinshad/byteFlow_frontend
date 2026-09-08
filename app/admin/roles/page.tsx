'use client';

import React from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Shield,
  Briefcase,
  User,
  Crown,
} from 'lucide-react';

export default function AdminRolesPage() {
  const permissions = [
    {
      name: 'Manage, Lock & Reset Other Administrators',
      description: 'Supreme governance over administrator accounts and platform hierarchy',
      superAdmin: true,
      admin: false,
      manager: false,
      member: false,
    },
    {
      name: 'Promote / Assign Administrator Roles',
      description: 'Elevate users to Admin or Super Admin status',
      superAdmin: true,
      admin: false,
      manager: false,
      member: false,
    },
    {
      name: 'Access Admin Management Portal',
      description: 'View executive analytics, reports, and administrative management tools',
      superAdmin: true,
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Manage, Lock & Reset Team Members / Managers',
      description: 'User management and credential resets for lower tier roles',
      superAdmin: true,
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Assign Users to Projects',
      description: 'Allocate and manage which team members have access to each project',
      superAdmin: true,
      admin: true,
      manager: false,
      member: false,
    },
    {
      name: 'Create New Projects',
      description: 'Initiate new Kanban boards with default workflow lanes',
      superAdmin: true,
      admin: true,
      manager: true,
      member: false,
    },
    {
      name: 'Edit & Alter Project Details',
      description: 'Rename projects, update descriptions, and alter project configurations',
      superAdmin: true,
      admin: true,
      manager: true,
      member: false,
    },
    {
      name: 'Delete / Archive Projects',
      description: 'Soft-delete projects and remove boards from workspace',
      superAdmin: true,
      admin: true,
      manager: true,
      member: false,
    },
    {
      name: 'Manage Cards & Move Workflow Lanes',
      description: 'Create tasks, drag cards across lanes, set priorities, and due dates',
      superAdmin: true,
      admin: true,
      manager: true,
      member: true,
    },
    {
      name: 'Post Comments & Tag Tasks',
      description: 'Collaborate with team members, add comments, and categorize with tags',
      superAdmin: true,
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Super Admin Card */}
        <div className="rounded-xl border border-purple-500/40 bg-card p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">SUPER ADMIN</h2>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Supreme Authority</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Highest tier governance. Full control over the entire system, including the ability to manage, lock, delete, and reset passwords for other Administrators.
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Key: Supreme Control • Admin Governance • Platform Hierarchy
          </div>
        </div>

        {/* Admin Card */}
        <div className="rounded-xl border border-primary/40 bg-card p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">ADMIN</h2>
              <span className="text-[10px] font-semibold text-primary uppercase">Workspace Authority</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Workspace administration. Manages projects and team allocations, but cannot reset passwords, lock, or alter other Administrators.
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-foreground font-semibold">
            Key: Team Management • Project Allocation • Reports
          </div>
        </div>

        {/* Manager Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">MANAGER</h2>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Project Lead</span>
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
          <p className="text-xs text-muted-foreground">Cross-role permission breakdown enforced by backend middleware and services</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5 w-2/5">Capability / Operation</th>
                <th className="px-4 py-3.5 text-center text-purple-600 dark:text-purple-400">SUPER ADMIN</th>
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
                  <td className="px-4 py-4 text-center">
                    {perm.superAdmin ? (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </td>
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border/40">
          {permissions.map((perm, i) => (
            <div key={i} className="p-4 space-y-2.5">
              <div>
                <div className="font-bold text-foreground text-xs">{perm.name}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{perm.description}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {([
                  { label: 'Super Admin', allowed: perm.superAdmin, color: 'purple' },
                  { label: 'Admin', allowed: perm.admin, color: 'emerald' },
                  { label: 'Manager', allowed: perm.manager, color: 'emerald' },
                  { label: 'Member', allowed: perm.member, color: 'emerald' },
                ] as const).map((role) => (
                  <div key={role.label} className="flex items-center gap-1">
                    {role.allowed ? (
                      <div className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${role.color === 'purple' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    ) : (
                      <div className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                        <X className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <span className={`text-[10px] font-medium ${role.allowed ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {role.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
