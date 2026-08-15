'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Tag } from '@/lib/api';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
  size?: 'xs' | 'sm';
}

export function TagBadge({ tag, onRemove, className = '', size = 'xs' }: TagBadgeProps) {
  const color = tag.color || '#6366f1';

  const isSmall = size === 'xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium transition-colors select-none ${
        isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      } ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-0.5 rounded-xs p-0.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-black/10 focus:outline-none"
          title={`Remove tag ${tag.name}`}
        >
          <X className={isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        </button>
      )}
    </span>
  );
}
