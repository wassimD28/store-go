import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retrieve the first character of each name and convert to uppercase.
 */
export function getInitials(fullName: string | undefined): string {
  if (!fullName) {
    return "U";
  }
  // Remove any extra whitespace and split the full name into parts.
  const names = fullName.trim().split(/\s+/);

  // If there's only one name provided, return its first letter in uppercase.
  if (names.length < 2) {
    return names[0].charAt(0).toUpperCase();
  }

  // Otherwise, extract the first letter from the first two names and convert them to uppercase.
  const firstInitial = names[0].charAt(0).toUpperCase();
  const lastInitial = names[1].charAt(0).toUpperCase();

  return firstInitial + lastInitial;
}

// Utility function to truncate email
export const truncateEmail = (email: string, maxLength: number = 10) => {
  if (email.length <= maxLength) return email;
  const localPart = email.split("@")[0];
  const domain = email.split("@")[1];

  if (localPart.length > maxLength - 3) {
    return `${localPart.slice(0, maxLength - 3)}...@${domain}`;
  }

  return `${localPart}...@${domain}`;
};

// Function to determine if a route is active
export const isActiveRoute = (route: string, pathname: string) => {
  // Exact match for dashboard-level routes
  if (route === "/dashboard" && pathname === "/dashboard") {
    return true;
  }

  // For nested routes, ensure we're in the correct section
  if (route.includes("/dashboard/") && pathname.includes("/dashboard/")) {
    const routeParts = route.split("/");
    const pathParts = pathname.split("/");

    // Match the section (3rd part in path)
    return routeParts[2] === pathParts[2];
  }

  // For store routes, handle special cases
  if (route.includes("/stores/")) {
    const routeParts = route.split("/");
    const pathParts = pathname.split("/");

    // Ensure store ID matches
    if (routeParts[2] !== pathParts[2]) return false;

    // For section level matching (like Products)
    if (routeParts.length >= 4 && pathParts.length >= 4) {
      return routeParts[3] === pathParts[3];
    }

    // For subsection matching (like Products/List)
    if (routeParts.length >= 5 && pathParts.length >= 5) {
      return routeParts[3] === pathParts[3] && routeParts[4] === pathParts[4];
    }
  }

  // Default to exact match
  return route === pathname;
};

// Add this to src/lib/utils.ts
export const isSubNavActive = (route: string, pathname: string) => {
  // Simple case: exact match
  if (route === pathname) return true;
  
  const routeSegments = route.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Must have at least 4 segments for store routes with sub-navigation
  if (routeSegments.length < 4 || pathSegments.length < 4) return false;
  
  // For store routes, match store ID and section
  if (routeSegments[0] === "stores") {
    // Make sure we're comparing routes in the same store
    if (routeSegments[1] !== pathSegments[1]) return false;
    
    // For store main sections (products, templates, etc.)
    if (routeSegments[2] !== pathSegments[2]) return false;
    
    // For subsections (categories, list, attributes, etc.)
    // Here we ensure we match the exact subsection
    if (routeSegments.length >= 4 && pathSegments.length >= 4) {
      return routeSegments[3] === pathSegments[3];
    }
  }
  
  // For dashboard sub-sections
  if (routeSegments[0] === "dashboard" && pathSegments[0] === "dashboard") {
    if (routeSegments.length >= 3 && pathSegments.length >= 3) {
      // Match subsections like apps, pages, themes
      return routeSegments[2] === pathSegments[2];
    }
  }
  
  // For team sub-sections
  if (routeSegments[0] === "team" && pathSegments[0] === "team") {
    if (routeSegments.length >= 2 && pathSegments.length >= 2) {
      // Match subsections like members, roles, invitations
      return routeSegments[1] === pathSegments[1];
    }
  }
  
  // Default to false if no conditions match
  return false;
};
// function for formatting date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Extracts the first name from a full name string.
 *
 * @param fullName - The full name string from which to extract the first name.
 *                   If the string is empty or undefined, an empty string is returned.
 * @returns The first name extracted from the full name. If the full name is empty or undefined, returns an empty string.
 */
export function getFirstName(fullName: string): string {
  if (!fullName) return "";
  const trimmedName = fullName.trim();
  const firstName = trimmedName.split(" ")[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

// Function to format time difference
export const formatTimeDifference = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // src/lib/utils.ts

import { 
  differenceInSeconds, 
  differenceInMinutes, 
  differenceInHours, 
  differenceInDays, 
  differenceInWeeks, 
  differenceInMonths, 
  differenceInYears 
} from "date-fns";

/**
 * Calculates a detailed duration string between two dates with precise time units
 * 
 * @param startDate - The starting date
 * @param endDate - The ending date
 * @param options - Options for formatting
 * @returns A formatted string representing the duration
 */
export function calculateDetailedDuration(
  startDate: Date, 
  endDate: Date,
  options: {
    includeSeconds?: boolean;
    maxUnits?: number;  // Maximum number of time units to include (e.g., 2 would show "2 months 5 days" but not smaller units)
    condensed?: boolean; // If true, returns more compact format (e.g., "2m 5d" instead of "2 months 5 days")
  } = {}
): string {
  const { 
    includeSeconds = false, 
    maxUnits = 3,
    condensed = false 
  } = options;
  
  if (!startDate || !endDate) return "Invalid dates";
  
  // Calculate differences in various time units
  const years = differenceInYears(endDate, startDate);
  const months = differenceInMonths(endDate, startDate) % 12;
  const weeks = differenceInWeeks(endDate, startDate) % 4;
  const days = differenceInDays(endDate, startDate) % 7;
  const hours = differenceInHours(endDate, startDate) % 24;
  const minutes = differenceInMinutes(endDate, startDate) % 60;
  const seconds = includeSeconds ? differenceInSeconds(endDate, startDate) % 60 : 0;
  
  // Initialize units array with calculated differences
  const units = [
    { value: years, singular: "year", plural: "years", short: "y" },
    { value: months, singular: "month", plural: "months", short: "m" },
    { value: weeks, singular: "week", plural: "weeks", short: "w" },
    { value: days, singular: "day", plural: "days", short: "d" },
    { value: hours, singular: "hour", plural: "hours", short: "h" },
    { value: minutes, singular: "minute", plural: "minutes", short: "min" },
  ];
  
  // Add seconds only if includeSeconds is true
  if (includeSeconds) {
    units.push({ value: seconds, singular: "second", plural: "seconds", short: "s" });
  }
  
  // Filter out units with zero value and limit to maxUnits
  const nonZeroUnits = units
    .filter(unit => unit.value > 0)
    .slice(0, maxUnits);
  
  // If all units are zero (same time), handle specially
  if (nonZeroUnits.length === 0) {
    // If dates are exactly the same or almost same
    if (includeSeconds) {
      return "0 seconds";
    } else if (differenceInSeconds(endDate, startDate) < 60) {
      return "Less than a minute";
    } else {
      return "Same time";
    }
  }
  
  // Format the duration string
  if (condensed) {
    return nonZeroUnits
      .map(unit => `${unit.value}${unit.short}`)
      .join(" ");
  } else {
    return nonZeroUnits
      .map(unit => {
        const label = unit.value === 1 ? unit.singular : unit.plural;
        return `${unit.value} ${label}`;
      })
      .join(", ");
  }
}

/**
 * Returns a human-readable duration estimate between two dates
 * Optimized for promotion duration display with natural language
 * 
 * @param startDate - The start date of the promotion
 * @param endDate - The end date of the promotion
 * @returns A formatted string representing the duration
 */
export function formatPromotionDuration(startDate: Date, endDate: Date): string {
  if (!startDate || !endDate) return "";
  
  const totalDays = differenceInDays(endDate, startDate);
  
  // Handle invalid duration
  if (totalDays < 0) {
    return "Invalid duration";
  }
  
  // Same day special case
  if (totalDays === 0) {
    const hours = differenceInHours(endDate, startDate);
    if (hours < 24 && hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return "Same day";
  }
  
  const years = differenceInYears(endDate, startDate);
  if (years > 0) {
    const remainingMonths = differenceInMonths(endDate, startDate) % 12;
    let result = `${years} year${years !== 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      result += ` and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return result;
  }
  
  const months = differenceInMonths(endDate, startDate);
  if (months > 0) {
    const remainingDays = totalDays - (months * 30);
    let result = `${months} month${months !== 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += ` and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
    return result;
  }
  
  const weeks = Math.floor(totalDays / 7);
  if (weeks > 0) {
    const remainingDays = totalDays % 7;
    let result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += ` and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
    return result;
  }
  
  // Just days
  return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
}


export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  // Implement a simple function to return time ago format like "2h ago", "3d ago", etc.
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  let result: string;
  
  if (diffInSeconds < minute) {
    result = 'just now';
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    result = `${minutes}m`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    result = `${hours}h`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    result = `${days}d`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    result = `${weeks}w`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    result = `${months}mo`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    result = `${years}y`;
  }
  
  return options?.addSuffix ? `${result} ago` : result;
}

/**
 * Converts status codes from uppercase with underscores to lowercase with spaces
 * 
 * @param {string} status - The status code in uppercase with underscores (e.g., "IN_PROGRESS")
 * @returns {string} The formatted status in lowercase with spaces (e.g., "in progress")
 */
export function formatStatus(status: string) {
  // Return early if status is not a string or is empty
  if (typeof status !== 'string' || status.trim() === '') {
    return '';
  }
  
  // Convert to lowercase and replace underscores with spaces
  return status.toLowerCase().replace(/_/g, ' ');
}
