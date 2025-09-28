import { isPowerOfTwo, getValidPowersOfTwo } from "@/lib/utils";
import { FormatService } from "./format-service";

export class SingleEliminationService implements FormatService {
  name = "single-elimination";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return isPowerOfTwo(qualifiers) && qualifiers <= participants;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (!isPowerOfTwo(qualifiers)) {
      const validPowers = getValidPowersOfTwo(participants);
      return `Qualifiers must be a power of 2. Valid options for ${participants} participants: ${validPowers.join(", ")}`;
    }
    if (qualifiers > participants) {
      const validPowers = getValidPowersOfTwo(participants);
      return `Qualifiers cannot exceed ${participants} participants. Valid options: ${validPowers.join(", ")}`;
    }
    return null;
  }

  getValidQualifierRange(participants: number): { min: number; max: number; validValues: number[] } {
    const validPowers = getValidPowersOfTwo(participants);
    return {
      min: validPowers.length > 0 ? validPowers[0] : 1,
      max: validPowers.length > 0 ? validPowers[validPowers.length - 1] : 1,
      validValues: validPowers
    };
  }
}