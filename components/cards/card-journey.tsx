'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route, ArrowRight } from 'lucide-react';
import { api, type ActivityLog } from '@/lib/api';

interface CardJourneyProps {
  cardId: string;
  currentLaneName?: string;
}

export function CardJourney({ cardId, currentLaneName }: CardJourneyProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'card', cardId],
    queryFn: () => api.activities.listByCard(cardId, 100),
    enabled: !!cardId,
  });

  const hops = useMemo(() => {
    const rawActivities = (data?.data || []) as ActivityLog[];
    // Sort chronological: oldest first
    const chron = [...rawActivities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const steps: string[] = [];

    // 1. Initial creation lane
    const createAct = chron.find((a) => a.action === 'CREATE_CARD');
    const firstMoveAct = chron.find((a) => a.action === 'MOVE_CARD');

    let initialLane =
      createAct?.lane?.name ||
      (createAct?.newValue as any)?.laneName ||
      (firstMoveAct?.oldValue as any)?.laneName ||
      null;

    if (initialLane) {
      steps.push(initialLane);
    }

    // 2. Add each lane move transition in chronological order
    for (const act of chron) {
      if (act.action === 'MOVE_CARD') {
        const destLane =
          act.lane?.name ||
          (act.newValue as any)?.laneName ||
          null;

        if (destLane) {
          // If no initial lane was set yet, use this move's source lane if available
          if (steps.length === 0) {
            const srcLane = (act.oldValue as any)?.laneName;
            if (srcLane) steps.push(srcLane);
          }
          // Only push if different from previous step (no redundant in-lane reorders)
          if (steps.length === 0 || steps[steps.length - 1] !== destLane) {
            steps.push(destLane);
          }
        }
      }
    }

    // 3. Ensure journey terminates with current lane
    if (currentLaneName) {
      if (steps.length === 0) {
        steps.push(currentLaneName);
      } else if (steps[steps.length - 1] !== currentLaneName) {
        steps.push(currentLaneName);
      }
    }

    return steps;
  }, [data, currentLaneName]);

  if (isLoading && hops.length === 0) {
    return null;
  }

  if (hops.length === 0) {
    return null;
  }

  return (
    <div data-role="card-journey" className="flex flex-wrap items-center gap-1.5 pt-0.5">
      {hops.map((laneName, index) => {
        const isCurrent = index === hops.length - 1;
        const isStart = index === 0;

        return (
          <React.Fragment key={`${laneName}-${index}`}>
            {index > 0 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            )}
            <span
              data-role={isCurrent ? 'journey-current-lane' : 'journey-lane-step'}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tracking-tight transition-colors ${
                isCurrent
                  ? 'bg-primary/10 text-primary border border-primary/30 font-semibold shadow-2xs'
                  : 'bg-muted/70 text-muted-foreground border border-border/50 hover:text-foreground'
              }`}
            >
              {isStart && hops.length > 1 && (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
              )}
              <span>{laneName}</span>
              {isCurrent && (
                <span
                  className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0"
                  title="Current Lane"
                />
              )}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
