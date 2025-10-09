import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIconUrl(url: string): string | null {
  try {
    return new URL(url)?.toString();
  } catch (e) {
    return null;
  }
}
