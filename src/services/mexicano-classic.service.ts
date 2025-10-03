import {
  Individual,
  Match,
  Participant,
  Pool,
  Round,
  Team,
} from "@/types/tournament.types";
import { FormatService } from "./format-service";

export class MexicanoClassicService implements FormatService {
  name = "mexicano";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return qualifiers >= 0 && qualifiers <= participants;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (participants < 4) {
      return "Mexicano format requires at least 4 players.";
    }
    if (participants % 4 !== 0) {
      return "Mexicano format requires the number of players to be a multiple of 4.";
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

  generatePools(participants: Participant[], qualifiers: number): Pool[] {
    if (participants.length < 4 || participants.length % 4 !== 0) {
      return [];
    }

    const sortedParticipants = [...participants].sort(
      (a, b) => a.seed - b.seed
    );

    const pool: Pool = {
      id: "pool-1",
      name: "Mexicano Pool",
      parties: sortedParticipants,
      rounds: this.generateRoundsForPool(sortedParticipants, 1),
    };

    return [pool];
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

      const currentTeams: Team[] = [];

      if (roundNum === 0) {
        const currentRoundPlayers = [fixedPlayer, ...rotatingPlayers];
        for (let i = 0; i < numPlayers / 2; i++) {
          const p1 = currentRoundPlayers[i];
          const p2 = currentRoundPlayers[numPlayers - 1 - i];
          const team: Team = {
            id: `team-r${roundNum + 1}-t${i + 1}`,
            name: `team-r${roundNum + 1}-t${i + 1}`,
            seed: (p1.seed + p2.seed) / 2,
            type: "team",
            members: [p1 as Individual, p2 as Individual],
          };
          currentTeams.push(team);
        }
      } else {
        const teamCount = numPlayers / 2;
        for (let i = 0; i < teamCount; i++) {
          const team: Team = {
            id: `team-placeholder-r${roundNum + 1}-t${i + 1}`,
            name: `Team ${i + 1} (TBD by standings)`,
            seed: 999,
            type: "team",
            members: [
              {
                id: `ph-p1-r${roundNum + 1}-t${i + 1}`,
                name: "Player (by standings)",
                seed: 999,
                type: "individual",
              },
              {
                id: `ph-p2-r${roundNum + 1}-t${i + 1}`,
                name: "Player (by standings)",
                seed: 999,
                type: "individual",
              },
            ],
          };
          currentTeams.push(team);
        }
      }

      // Generate matches from the created teams (real or placeholder)
      for (let i = 0; i < currentTeams.length; i += 2) {
        const team_a = currentTeams[i];
        const team_b = currentTeams[i + 1];
        const match: Match = {
          id: `match-p${poolNumber}-r${roundNum + 1}-m${i / 2 + 1}`,
          party1: team_a,
          party2: team_b,
          winner: null,
          clashId: `clash-p${poolNumber}-r${roundNum + 1}-${i / 2 + 1}`,
        };
        round.matches.push(match);
      }

      rounds.push(round);

      // Rotate players for the next round's structural pairing
      rotatingPlayers.unshift(rotatingPlayers.pop()!);
    }

    return rounds;
  }
}
