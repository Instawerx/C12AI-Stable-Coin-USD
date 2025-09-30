/**
 * Utility function to merge CSS classes
 * Simple class name combiner for development
 */
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}