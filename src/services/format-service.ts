import { Participant, Pool } from "@/types/tournament.types";

export interface FormatService {
  name: string;
  validateQualifiers(qualifiers: number, participants: number): boolean;
  getErrorMessage(qualifiers: number, participants: number): string | null;
  getValidQualifierRange(participants: number): { min: number; max: number; validValues?: number[] };
  generatePools(participants: Participant[], qualifiers: number): Pool[];
}