import { FormatService } from "./format-service";

export class RoundRobinService implements FormatService {
  name = "round-robin";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return qualifiers >= 0 && qualifiers <= participants;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (qualifiers < 0) {
      return "Qualifiers cannot be negative";
    }
    if (qualifiers > participants) {
      return `Qualifiers cannot exceed ${participants} (total participants in this stage)`;
    }
    return null;
  }

  getValidQualifierRange(participants: number): { min: number; max: number } {
    return { min: 0, max: participants };
  }
}