import { FormatService } from "./format-service";
import { Pool, Round, Match, Participant } from "@/types/tournament.types";

export class SwissService implements FormatService {
  name = "swiss";

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

  getDefaultRoundCount(participantCount: number): number {
    if (participantCount <= 2) return 1;

    return Math.ceil(Math.log2(participantCount));
  }

  getMaxRoundCount(participantCount: number): number {
    return participantCount - 1;
  }

  getMinRoundCount(): number {
    return 1;
  }

  validateRoundCount(roundCount: number, participantCount: number): boolean {
    return (
      roundCount >= this.getMinRoundCount() &&
      roundCount <= this.getMaxRoundCount(participantCount)
    );
  }

  generatePools(
    participants: Participant[],
    qualifiers: number,
    roundCount?: number
  ): Pool[] {
    if (participants.length === 0) return [];

    const finalRoundCount =
      roundCount || this.getDefaultRoundCount(participants.length);
    const validatedRoundCount = Math.min(
      Math.max(finalRoundCount, this.getMinRoundCount()),
      this.getMaxRoundCount(participants.length)
    );

    const sortedParticipants = [...participants].sort(
      (a, b) => a.seed - b.seed
    );

    const pool: Pool = {
      id: "pool-1",
      name: "Swiss Pool",
      parties: sortedParticipants,
      rounds: this.generateRounds(sortedParticipants, validatedRoundCount),
    };

    return [pool];
  }

  private generateRounds(
    participants: Participant[],
    roundCount: number
  ): Round[] {
    const rounds: Round[] = [];
    const participantCount = participants.length;
    const hasOddParticipants = participantCount % 2 === 1;

    for (let roundNum = 1; roundNum <= roundCount; roundNum++) {
      const round: Round = {
        id: `swiss-round-${roundNum}`,
        byes: [],
        matches: [],
      };

      if (roundNum === 1) {
        const midpoint = Math.floor(participantCount / 2);

        if (hasOddParticipants) {
          round.byes.push(participants[participantCount - 1]);
        }

        const matchCount = Math.floor(participantCount / 2);
        for (let i = 0; i < matchCount; i++) {
          const match: Match = {
            id: `swiss-r${roundNum}-m${i + 1}`,
            party1: participants[i],
            party2:
              participants[
                participantCount - 1 - i - (hasOddParticipants ? 1 : 0)
              ],
            winner: null,
            clashId: `clash-swiss-r${roundNum}-${i + 1}`,
          };
          round.matches.push(match);
        }
      } else {
        const matchCount = Math.floor(participantCount / 2);

        if (hasOddParticipants) {
          const byeParticipant: Participant = {
            id: `bye-placeholder-r${roundNum}`,
            name: `Bye (TBD based on standings)`,
            seed: 999,
            type: "placeholder",
          };
          round.byes.push(byeParticipant);
        }

        for (let i = 0; i < matchCount; i++) {
          const match: Match = {
            id: `swiss-r${roundNum}-m${i + 1}`,
            party1: {
              id: `swiss-r${roundNum}-p1-m${i + 1}`,
              name: `Player ${i * 2 + 1} (by standings)`,
              seed: 999,
              type: "placeholder",
            },
            party2: {
              id: `swiss-r${roundNum}-p2-m${i + 1}`,
              name: `Player ${i * 2 + 2} (by standings)`,
              seed: 999,
              type: "placeholder",
            },
            winner: null,
            clashId: `clash-swiss-r${roundNum}-${i + 1}`,
          };
          round.matches.push(match);
        }
      }

      rounds.push(round);
    }

    return rounds;
  }

  getRoundName(roundNumber: number, totalRounds: number): string {
    return `Round ${roundNumber} of ${totalRounds}`;
  }

  calculateRoundsNeeded(participantCount: number): number {
    return this.getDefaultRoundCount(participantCount);
  }

  validateSwissSetup(
    participantCount: number,
    roundCount: number
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (participantCount < 2) {
      errors.push("Swiss format requires at least 2 participants");
    }

    if (roundCount < this.getMinRoundCount()) {
      errors.push(`Must have at least ${this.getMinRoundCount()} round`);
    }

    if (roundCount > this.getMaxRoundCount(participantCount)) {
      errors.push(
        `Cannot have more than ${this.getMaxRoundCount(
          participantCount
        )} rounds with ${participantCount} participants`
      );
    }

    const recommendedRounds = this.getDefaultRoundCount(participantCount);
    if (roundCount < recommendedRounds) {
      warnings.push(
        `Recommended round count for ${participantCount} participants is ${recommendedRounds}. Using fewer rounds may not provide sufficient differentiation.`
      );
    }

    if (participantCount % 2 === 1) {
      warnings.push(
        "Odd number of participants - one player will receive a bye each round"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
