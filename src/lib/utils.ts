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
