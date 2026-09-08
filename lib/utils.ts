import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDoneLane(laneName?: string | null): boolean {
  if (!laneName) return false;
  return /done|complete|completed|closed|finished|shipped|released|published/i.test(laneName);
}
