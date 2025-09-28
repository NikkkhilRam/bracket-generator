import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isPowerOfTwo(num: number): boolean {
  return num > 0 && (num & (num - 1)) === 0;
}

export function getMaxPowerOfTwo(n: number): number {
  if (n <= 0) return 0;
  let power = 1;
  while (power * 2 <= n) {
    power *= 2;
  }
  return power;
}

export function getValidPowersOfTwo(maxParticipants: number): number[] {
  const powers: number[] = [];
  let power = 1;
  while (power <= maxParticipants) {
    powers.push(power);
    power *= 2;
  }
  return powers;
}