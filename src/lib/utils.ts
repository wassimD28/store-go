import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/** 
* Retrieve the first character of each name and convert to uppercase.
*/
export function getInitials(fullName: string |undefined): string {
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
  const localPart = email.split('@')[0];
  const domain = email.split('@')[1];
  
  if (localPart.length > maxLength - 3) {
    return `${localPart.slice(0, maxLength - 3)}...@${domain}`;
  }
  
  return `${localPart}...@${domain}`;
};