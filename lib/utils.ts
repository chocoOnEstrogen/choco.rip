import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names using clsx and tailwind-merge
 * 
 * This utility function takes any number of class name arguments and:
 * 1. Processes them through clsx to handle conditional classes and arrays
 * 2. Merges the resulting classes with tailwind-merge to handle Tailwind CSS conflicts
 * 
 * @param inputs - Array of class names, objects, or arrays to be processed
 * @returns Merged and deduplicated class name string
 * 
 * @example
 * ```ts
 * cn('px-2 py-1', 'bg-red-500', { 'text-white': true })
 * // Returns: 'px-2 py-1 bg-red-500 text-white'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into a localized date string with full month name
 * 
 * @param date - The date string to format
 * @returns Formatted date string in the format "Month Day, Year"
 * 
 * @example
 * formatDate("2024-03-20") // "March 20, 2024"
 */
export function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Formats a number into a human-readable string with appropriate suffix
 * 
 * @param number - The number to format
 * @returns Formatted string with k/M suffix for thousands/millions
 * 
 * @example
 * formatNumber(1234) // "1.2k"
 * formatNumber(1234567) // "1.2M"
 * formatNumber(999) // "999"
 */
export function formatNumber(number: number): string {
  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }
  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}k`;
  }
  return number.toString();
}

/**
 * Generates a URL for a repository SVG image with the specified parameters
 * 
 * @param name - The name of the repository
 * @param description - A brief description of the repository
 * @param stars - Number of stars the repository has
 * @param forks - Number of forks the repository has
 * @param issues - Number of open issues
 * @param updated - Last update timestamp
 * @param license - Repository license
 * @returns URL string pointing to the generated SVG
 * 
 * @example
 * makeRepoSVG(
 *   "my-repo",
 *   "A cool project",
 *   1234,
 *   56,
 *   7,
 *   "2 days ago",
 *   "MIT"
 * ) // "/internal/repo.svg?name=my-repo&description=A+cool+project&stars=1.2k&forks=56&issues=7&updated=2+days+ago&license=MIT"
 */
export function makeRepoSVG(name: string, description: string, stars: number, forks: number, issues: number, updated: string, license: string) {
  const params = new URLSearchParams({
    name: name,
    description: description,
    stars: formatNumber(stars),
    forks: formatNumber(forks),
    issues: formatNumber(issues),
    updated: updated,
    license: license
  });

  return `/internal/repo.svg?${params.toString()}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
