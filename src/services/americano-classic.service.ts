import {
  Individual,
  Match,
  Participant,
  Pool,
  Round,
  Team,
} from "@/types/tournament.types";
import { FormatService } from "./format-service";

export class AmericanoClassicService implements FormatService {
  name = "americano";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return qualifiers >= 0 && qualifiers <= participants;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (participants < 4) {
      return "Americano format requires at least 4 players.";
    }
    if (participants % 4 !== 0) {
      return "An even number of players is recommended to avoid byes in every round.";
    }
    return null;
  }

  getValidQualifierRange(participants: number): {
    min: number;
    max: number;
    validValues?: number[];
  } {
    return { min: 0, max: participants };
  }

  getMaxPoolCount(participantCount: number) {
    return Math.floor(participantCount / 4);
  }

  generatePools(
    participants: Participant[],
    qualifiers: number,
    poolCount: number = 1
  ): Pool[] {
    if (participants.length < 4) {
      return [];
    }

    const validPoolCount = Math.min(
      poolCount,
      this.getMaxPoolCount(participants.length)
    );

    const pools: Pool[] = [];
    const participantsPerPool = Math.ceil(participants.length / validPoolCount);

    const sortedParticipants = [...participants].sort(
      (a, b) => a.seed - b.seed
    );

    for (let i = 0; i < validPoolCount; i++) {
      const startIndex = i * participantsPerPool;
      const endIndex = Math.min(
        startIndex + participantsPerPool,
        sortedParticipants.length
      );
      const poolParticipants = sortedParticipants.slice(startIndex, endIndex);

      if (poolParticipants.length > 0) {
        const pool: Pool = {
          id: `pool-${i + 1}`,
          name: `Pool ${String.fromCharCode(65 + i)}`,
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
    const numPlayers = participants.length;

    const numRounds = numPlayers - 1;
    const rounds: Round[] = [];

    const fixedPlayer = participants[0];
    let rotatingPlayers = participants.slice(1);

    for (let roundNum = 0; roundNum < numRounds; roundNum++) {
      const round: Round = {
        id: `round-${roundNum + 1}`,
        byes: [],
        matches: [],
      };

      // Initiate the first team
      const currentPairings: Team[] = [];
      currentPairings.push({
        id: "team-1",
        name: "team-1",
        seed: 1,
        type: "team",
        members: [fixedPlayer as Individual, rotatingPlayers[0] as Individual],
      });

      // Generate teams for the rest of the players
      for (let i = 1; i < Math.floor(numPlayers / 2); i++) {
        const team: Team = {
          id: `team-${i + 1}`,
          name: `team-${i + 1}`,
          seed: 1,
          type: "team",
          members: [
            rotatingPlayers[i] as Individual,
            rotatingPlayers[rotatingPlayers.length - i] as Individual,
          ],
        };

        currentPairings.push(team);
      }

      // Generate matches
      for (let i = 0; i < currentPairings.length; i += 2) {
        const team_a = currentPairings[i];
        const team_b = currentPairings[i + 1];
        const match: Match = {
          id: `match-${i + 1}`,
          party1: team_a,
          party2: team_b,
          winner: null,
          clashId: `clash-p${poolNumber}-r${roundNum}-${i + 1}`,
        };

        round.matches.push(match);
      }

      rounds.push(round);

      // Rotate the players.
      rotatingPlayers = [
        rotatingPlayers[rotatingPlayers.length - 1],
        ...rotatingPlayers.slice(0, -1),
      ];
    }

    return rounds;
  }
}
