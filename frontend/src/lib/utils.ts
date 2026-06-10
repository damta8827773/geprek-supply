import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names. shadcn/21st.dev components expect a `cn` helper here.
 * We reuse the already-installed `clsx` (no extra dependency).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
