import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { DRIFT_PROGRAM_ID } from "@drift-labs/sdk";
import { KVAULT_PROGRAM_ID_MAINNET as KAMINO_PROGRAM_ID } from "~/program/kamino/address";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIconUrl(url: string): string | null {
  if (!url) return null;

  try {
    return new URL(url)?.toString();
  } catch (e) {
    console.error(e, { url });
    return null;
  }
}

export function getEarnMeta(programId: string): {
  name: string;
  iconUrl: string | undefined;
} {
  if (programId === DRIFT_PROGRAM_ID) {
    return { name: "Drift", iconUrl: "/drift-logo.png" };
  } else if (programId === KAMINO_PROGRAM_ID) {
    return { name: "Kamino", iconUrl: "/kamino-logo.jpg" };
  } else {
    return { name: "Unknown", iconUrl: undefined };
  }
}
