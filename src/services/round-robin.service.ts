import { FormatService } from "./format-service";
import { Pool, Round, Match, Participant } from "@/types/tournament.types";

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

  getDefaultPoolCount(participantCount: number): number {
    if (participantCount <= 8) {
      return 1;
    }
    return 2;
  }

  getMaxPoolCount(participantCount: number): number {
    return Math.floor(participantCount / 2);
  }

  validatePoolCount(poolCount: number, participantCount: number): boolean {
    return (
      poolCount >= 1 && poolCount <= this.getMaxPoolCount(participantCount)
    );
  }

  generatePools(
    participants: Participant[],
    qualifiers: number,
    poolCount?: number
  ): Pool[] {
    if (participants.length === 0) return [];

    const finalPoolCount =
      poolCount || this.getDefaultPoolCount(participants.length);
    const validatedPoolCount = Math.min(
      finalPoolCount,
      this.getMaxPoolCount(participants.length)
    );

    const pools: Pool[] = [];
    const participantsPerPool = Math.ceil(
      participants.length / validatedPoolCount
    );

    const sortedParticipants = [...participants].sort(
      (a, b) => a.seed - b.seed
    );

    for (let i = 0; i < validatedPoolCount; i++) {
      const startIndex = i * participantsPerPool;
      const endIndex = Math.min(
        startIndex + participantsPerPool,
        sortedParticipants.length
      );
      const poolParticipants = sortedParticipants.slice(startIndex, endIndex);

      if (poolParticipants.length > 0) {
        const pool: Pool = {
          id: `pool-${i + 1}`,
          name: `Group ${String.fromCharCode(65 + i)}`,
          parties: poolParticipants,
          rounds: this.generateRoundsForPool(poolParticipants, i + 1),
        };
        pools.push(pool);
      }
    }

    return pools;
  }

  private generateRoundsForPool(
    participants: Participant[],
    poolNumber: number
  ): Round[] {
    if (participants.length < 2) return [];

    const rounds: Round[] = [];
    const numParticipants = participants.length;
    const numRounds =
      numParticipants % 2 === 0 ? numParticipants - 1 : numParticipants;

    const workingArray = [...participants];
    if (numParticipants % 2 === 1) {
      workingArray.push(null as any);
    }

    const totalTeams = workingArray.length;

    for (let roundNum = 1; roundNum <= numRounds; roundNum++) {
      const matches: Match[] = [];
      const byes: Participant[] = [];

      for (let i = 0; i < totalTeams / 2; i++) {
        const team1 = workingArray[i];
        const team2 = workingArray[totalTeams - 1 - i];

        if (team1 && team2) {
          const match: Match = {
            id: `p${poolNumber}-r${roundNum}-m${i + 1}`,
            party1: team1,
            party2: team2,
            winner: null,
            clashId: `clash-p${poolNumber}-r${roundNum}-${i + 1}`,
          };
          matches.push(match);
        } else if (team1 && !team2) {
          byes.push(team1);
        } else if (!team1 && team2) {
          byes.push(team2);
        }
      }

      const round: Round = {
        id: `p${poolNumber}-round-${roundNum}`,
        byes,
        matches,
      };
      rounds.push(round);

      if (roundNum < numRounds) {
        const lastTeam = workingArray.pop();
        if (lastTeam !== undefined) {
          workingArray.splice(1, 0, lastTeam);
        }
      }
    }

    return rounds;
  }

  calculateMatchesInPool(participantCount: number): number {
    if (participantCount < 2) return 0;
    return (participantCount * (participantCount - 1)) / 2;
  }

  getPoolDistribution(participantCount: number, poolCount: number): number[] {
    const distribution: number[] = [];
    const participantsPerPool = Math.ceil(participantCount / poolCount);

    for (let i = 0; i < poolCount; i++) {
      const startIndex = i * participantsPerPool;
      const endIndex = Math.min(
        startIndex + participantsPerPool,
        participantCount
      );
      const poolSize = Math.max(0, endIndex - startIndex);
      if (poolSize > 0) {
        distribution.push(poolSize);
      }
    }

    return distribution;
  }

  getRoundName(roundNumber: number, totalRounds: number): string {
    return `Round ${roundNumber}`;
  }

  calculateRoundsNeeded(participantCount: number): number {
    if (participantCount < 2) return 0;
    return participantCount % 2 === 0 ? participantCount - 1 : participantCount;
  }

  validatePoolSetup(
    participantCount: number,
    poolCount: number
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (poolCount < 1) {
      errors.push("Must have at least 1 pool");
    }

    if (poolCount > this.getMaxPoolCount(participantCount)) {
      errors.push(
        `Cannot have more than ${this.getMaxPoolCount(
          participantCount
        )} pools with ${participantCount} participants (each pool needs at least 2 participants)`
      );
    }

    const distribution = this.getPoolDistribution(participantCount, poolCount);
    const minPoolSize = Math.min(...distribution);
    const maxPoolSize = Math.max(...distribution);

    if (minPoolSize < 2) {
      errors.push("Each pool must have at least 2 participants");
    }

    if (maxPoolSize - minPoolSize > 1) {
      warnings.push(
        "Pool sizes are uneven - some pools will have more participants than others"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
