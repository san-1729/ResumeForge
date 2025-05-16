/**
 * Utility functions for date formatting
 */

/**
 * Formats a LinkedIn date object (with year and optional month) into a readable string
 * @param dateObj LinkedIn date object with optional year and month
 * @returns Formatted date string (e.g., "Jan 2020" or "2020" or "Present")
 */
export const formatDate = (dateObj?: { year?: number, month?: number } | null): string => {
  if (!dateObj) return 'Present';
  const { year, month } = dateObj;
  if (!year) return '';
  const monthName = month ? new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' }) : '';
  return monthName ? `${monthName} ${year}` : `${year}`;
};
