import { isPowerOfTwo, getValidPowersOfTwo } from "@/lib/utils";
import { FormatService } from "./format-service";
import {
  Stage,
  Pool,
  Round,
  Match,
  Participant,
} from "@/types/tournament.types";

export class SingleEliminationService implements FormatService {
  name = "single-elimination";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return isPowerOfTwo(qualifiers) && qualifiers <= participants;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (!isPowerOfTwo(qualifiers)) {
      const validPowers = getValidPowersOfTwo(participants);
      return `Qualifiers must be a power of 2. Valid options for ${participants} participants: ${validPowers.join(
        ", "
      )}`;
    }
    if (qualifiers > participants) {
      const validPowers = getValidPowersOfTwo(participants);
      return `Qualifiers cannot exceed ${participants} participants. Valid options: ${validPowers.join(
        ", "
      )}`;
    }
    return null;
  }

  getValidQualifierRange(participants: number): {
    min: number;
    max: number;
    validValues: number[];
  } {
    const validPowers = getValidPowersOfTwo(participants);
    return {
      min: validPowers.length > 0 ? validPowers[0] : 1,
      max: validPowers.length > 0 ? validPowers[validPowers.length - 1] : 1,
      validValues: validPowers,
    };
  }

  generatePools(participants: Participant[], qualifiers: number): Pool[] {
    const pool: Pool = {
      id: `pool-1`,
      name: "Group A",
      parties: participants,
      rounds: this.generateRounds(
        participants,
        qualifiers,
      ),
    };

    return [pool];
  }

  private generateRounds(
    participants: Participant[],
    qualifiers: number,
  ): Round[] {
    const rounds: Round[] = [];

    const nextPowerOf2 = this.getNextPowerOf2(participants.length);

    const sortedParticipants = [...participants].sort(
      (a, b) => a.seed - b.seed
    );

    let currentRoundParticipants = sortedParticipants;
    let roundNumber = 1;

    while (currentRoundParticipants.length > qualifiers) {
      const round = this.generateRound(
        currentRoundParticipants,
        nextPowerOf2,
        roundNumber,
        roundNumber === 1
      );

      rounds.push(round);

      const byesCount = round.byes.length;
      const winnersCount = round.matches.length;
      const nextRoundParticipantCount = byesCount + winnersCount;

      currentRoundParticipants = this.createPlaceholderParticipants(
        round.byes,
        round.matches,
        nextRoundParticipantCount
      );

      roundNumber++;
    }

    return rounds;
  }

  private generateRound(
    currentParticipants: Participant[],
    nextPowerOf2: number,
    roundNumber: number,
    isFirstRound: boolean
  ): Round {
    const matches: Match[] = [];
    const byes: Participant[] = [];

    if (isFirstRound) {
      const totalByes = nextPowerOf2 - currentParticipants.length;

      for (let i = 0; i < totalByes; i++) {
        byes.push(currentParticipants[i]);
      }

      const playingParticipants = currentParticipants.slice(totalByes);
      for (let i = 0; i < playingParticipants.length; i += 2) {
        if (i + 1 < playingParticipants.length) {
          const match: Match = {
            id: `r${roundNumber}-m${Math.floor(i / 2) + 1}`,
            party1: playingParticipants[i],
            party2: playingParticipants[i + 1],
            winner: null,
            clashId: `clash-r${roundNumber}-${
              Math.floor(i / 2) + 1
            }`,
          };
          matches.push(match);
        }
      }
    } else {
      for (let i = 0; i < currentParticipants.length; i += 2) {
        if (i + 1 < currentParticipants.length) {
          const match: Match = {
            id: `r${roundNumber}-m${Math.floor(i / 2) + 1}`,
            party1: currentParticipants[i],
            party2: currentParticipants[i + 1],
            winner: null,
            clashId: `clash-r${roundNumber}-${
              Math.floor(i / 2) + 1
            }`,
          };
          matches.push(match);
        }
      }
    }

    return {
      id: `round-${roundNumber}`,
      byes,
      matches,
    };
  }

  private createPlaceholderParticipants(
    byes: Participant[],
    matches: Match[],
    totalNeeded: number
  ): Participant[] {
    const participants: Participant[] = [];

    participants.push(...byes);

    for (
      let i = 0;
      i < matches.length && participants.length < totalNeeded;
      i++
    ) {
      const placeholderParticipant: Participant = {
        id: `winner-${matches[i].id}`,
        name: `Winner of ${matches[i].party1?.name} vs ${matches[i].party2?.name}`,
        seed: Math.min(
          matches[i].party1?.seed || 999,
          matches[i].party2?.seed || 999
        ),
      };
      participants.push(placeholderParticipant);
    }

    return participants;
  }

  private getNextPowerOf2(n: number): number {
    let power = 1;
    while (power < n) {
      power *= 2;
    }
    return power;
  }

  calculateRoundsNeeded(participantCount: number, qualifiers: number): number {
    const nextPowerOf2 = this.getNextPowerOf2(participantCount);
    let rounds = 0;
    let remaining = nextPowerOf2;

    while (remaining > qualifiers) {
      remaining = remaining / 2;
      rounds++;
    }

    return rounds;
  }

  getRoundName(
    roundNumber: number,
    totalRounds: number,
    qualifiers: number
  ): string {
    if (qualifiers === 1) {
      if (roundNumber === totalRounds) return "Final";
      if (roundNumber === totalRounds - 1) return "Semi-Final";
      if (roundNumber === totalRounds - 2) return "Quarter-Final";
      if (roundNumber === 1) return "First Round";
      return `Round ${roundNumber}`;
    } else {
      if (roundNumber === totalRounds)
        return `Round ${roundNumber} (Final Qualifying)`;
      return `Round ${roundNumber}`;
    }
  }
}
