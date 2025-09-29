import { isPowerOfTwo, getValidPowersOfTwo } from "@/lib/utils";
import { FormatService } from "./format-service";
import {
  Pool,
  Round,
  Match,
  Participant,
} from "@/types/tournament.types";

export class DoubleEliminationService implements FormatService {
  name = "double-elimination";

  validateQualifiers(qualifiers: number, participants: number): boolean {
    return qualifiers === 1 && participants >= 2;
  }

  getErrorMessage(qualifiers: number, participants: number): string | null {
    if (participants < 2) {
      return "Double elimination requires at least 2 participants";
    }
    if (qualifiers !== 1) {
      return "Double elimination must qualify exactly 1 winner (it must be the final stage)";
    }
    return null;
  }

  getValidQualifierRange(participants: number): {
    min: number;
    max: number;
    validValues: number[];
  } {
    return {
      min: 1,
      max: 1,
      validValues: [1],
    };
  }

  generatePools(participants: Participant[], qualifiers: number): Pool[] {
    const winnersPool: Pool = {
      id: "pool-winners",
      name: "Winners Bracket",
      parties: participants,
      rounds: this.generateWinnersBracket(participants),
    };

    const losersPool: Pool = {
      id: "pool-losers",
      name: "Losers Bracket",
      parties: [],
      rounds: this.generateLosersBracket(participants),
    };

    const grandFinalPool: Pool = {
      id: "pool-grand-final",
      name: "Grand Final",
      parties: [],
      rounds: this.generateGrandFinal(),
    };

    return [winnersPool, losersPool, grandFinalPool];
  }

  private generateWinnersBracket(participants: Participant[]): Round[] {
    const rounds: Round[] = [];
    const nextPowerOf2 = this.getNextPowerOf2(participants.length);
    const sortedParticipants = [...participants].sort((a, b) => a.seed - b.seed);

    let currentRoundParticipants = sortedParticipants;
    let roundNumber = 1;

    while (currentRoundParticipants.length > 1) {
      const round = this.generateRound(
        currentRoundParticipants,
        nextPowerOf2,
        roundNumber,
        roundNumber === 1,
        "W"
      );

      rounds.push(round);

      const byesCount = round.byes.length;
      const winnersCount = round.matches.length;
      const nextRoundParticipantCount = byesCount + winnersCount;

      currentRoundParticipants = this.createPlaceholderParticipants(
        round.byes,
        round.matches,
        nextRoundParticipantCount,
        "winner"
      );

      roundNumber++;
    }

    return rounds;
  }

  private generateLosersBracket(participants: Participant[]): Round[] {
    const rounds: Round[] = [];
    const nextPowerOf2 = this.getNextPowerOf2(participants.length);
    const winnersRoundsCount = this.calculateWinnersRoundsNeeded(participants.length);
    
    if (winnersRoundsCount <= 1) {
      return rounds;
    }

    let roundNumber = 1;
    let currentLosersInPlay = 0;

    for (let winnersRound = 1; winnersRound < winnersRoundsCount; winnersRound++) {
      const winnersMatchesThisRound = this.getWinnersRoundMatchCount(participants.length, winnersRound);
      
      if (winnersMatchesThisRound === 0) continue;

      if (winnersRound === 1) {
        if (winnersMatchesThisRound === 1) {
          currentLosersInPlay = 2;
          
          const match: Match = {
            id: `L-r${roundNumber}-m1`,
            party1: {
              id: `loser-W-r1-m1`,
              name: `Loser of Winners R1 M1`,
              seed: 999,
              type: "loser",
            },
            party2: {
              id: `loser-W-r2-m1`,
              name: `Loser of Winners R2 M1`,
              seed: 999,
              type: "loser",
            },
            winner: null,
            clashId: `clash-L-r${roundNumber}-1`,
          };

          rounds.push({
            id: `L-round-${roundNumber}`,
            byes: [],
            matches: [match],
          });
          
          currentLosersInPlay = 1;
          roundNumber++;
        } else {
          const matches: Match[] = [];
          const numMatches = Math.floor(winnersMatchesThisRound / 2);
          
          for (let j = 0; j < numMatches; j++) {
            const match: Match = {
              id: `L-r${roundNumber}-m${j + 1}`,
              party1: {
                id: `loser-W-r${winnersRound}-m${j * 2 + 1}`,
                name: `Loser of Winners R${winnersRound} M${j * 2 + 1}`,
                seed: 999,
                type: "loser",
              },
              party2: {
                id: `loser-W-r${winnersRound}-m${j * 2 + 2}`,
                name: `Loser of Winners R${winnersRound} M${j * 2 + 2}`,
                seed: 999,
                type: "loser",
              },
              winner: null,
              clashId: `clash-L-r${roundNumber}-${j + 1}`,
            };
            matches.push(match);
          }

          if (matches.length > 0) {
            rounds.push({
              id: `L-round-${roundNumber}`,
              byes: [],
              matches,
            });
            
            currentLosersInPlay = matches.length;
            roundNumber++;
          }
        }
      } else {
        const matches: Match[] = [];
        
        for (let j = 0; j < Math.min(currentLosersInPlay, winnersMatchesThisRound); j++) {
          const match: Match = {
            id: `L-r${roundNumber}-m${j + 1}`,
            party1: {
              id: `winner-L-r${roundNumber - 1}-m${j + 1}`,
              name: `Winner of Losers R${roundNumber - 1} M${j + 1}`,
              seed: 999,
              type: "winner",
            },
            party2: {
              id: `loser-W-r${winnersRound}-m${j + 1}`,
              name: `Loser of Winners R${winnersRound} M${j + 1}`,
              seed: 999,
              type: "loser",
            },
            winner: null,
            clashId: `clash-L-r${roundNumber}-${j + 1}`,
          };
          matches.push(match);
        }

        if (matches.length > 0) {
          rounds.push({
            id: `L-round-${roundNumber}`,
            byes: [],
            matches,
          });
          
          currentLosersInPlay = matches.length;
          roundNumber++;

          if (currentLosersInPlay > 1) {
            const mergeMatches: Match[] = [];
            const numMergeMatches = Math.floor(currentLosersInPlay / 2);
            
            for (let j = 0; j < numMergeMatches; j++) {
              const match: Match = {
                id: `L-r${roundNumber}-m${j + 1}`,
                party1: {
                  id: `winner-L-r${roundNumber - 1}-m${j * 2 + 1}`,
                  name: `Winner of Losers R${roundNumber - 1} M${j * 2 + 1}`,
                  seed: 999,
                  type: "winner",
                },
                party2: {
                  id: `winner-L-r${roundNumber - 1}-m${j * 2 + 2}`,
                  name: `Winner of Losers R${roundNumber - 1} M${j * 2 + 2}`,
                  seed: 999,
                  type: "winner",
                },
                winner: null,
                clashId: `clash-L-r${roundNumber}-${j + 1}`,
              };
              mergeMatches.push(match);
            }

            if (mergeMatches.length > 0) {
              rounds.push({
                id: `L-round-${roundNumber}`,
                byes: [],
                matches: mergeMatches,
              });
              
              currentLosersInPlay = mergeMatches.length;
              roundNumber++;
            }
          }
        }
      }
    }

    return rounds;
  }

  private generateGrandFinal(): Round[] {
    const finalMatch: Match = {
      id: "GF-m1",
      party1: {
        id: "winner-winners-bracket",
        name: "Winner of Winners Bracket",
        seed: 1,
        type: "winner",
      },
      party2: {
        id: "winner-losers-bracket",
        name: "Winner of Losers Bracket",
        seed: 2,
        type: "winner",
      },
      winner: null,
      clashId: "clash-grand-final",
    };

    const bracketResetMatch: Match = {
      id: "GF-reset-m1",
      party1: {
        id: "loser-GF-m1",
        name: "Loser of Grand Final",
        seed: 999,
        type: "loser",
      },
      party2: {
        id: "winner-GF-m1",
        name: "Winner of Grand Final",
        seed: 999,
        type: "winner",
      },
      winner: null,
      clashId: "clash-grand-final-reset",
    };

    return [
      {
        id: "GF-round-1",
        byes: [],
        matches: [finalMatch],
      },
      {
        id: "GF-round-2",
        byes: [],
        matches: [bracketResetMatch],
      },
    ];
  }

  private generateRound(
    currentParticipants: Participant[],
    nextPowerOf2: number,
    roundNumber: number,
    isFirstRound: boolean,
    prefix: string
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
            id: `${prefix}-r${roundNumber}-m${Math.floor(i / 2) + 1}`,
            party1: playingParticipants[i],
            party2: playingParticipants[i + 1],
            winner: null,
            clashId: `clash-${prefix}-r${roundNumber}-${Math.floor(i / 2) + 1}`,
          };
          matches.push(match);
        }
      }
    } else {
      for (let i = 0; i < currentParticipants.length; i += 2) {
        if (i + 1 < currentParticipants.length) {
          const match: Match = {
            id: `${prefix}-r${roundNumber}-m${Math.floor(i / 2) + 1}`,
            party1: currentParticipants[i],
            party2: currentParticipants[i + 1],
            winner: null,
            clashId: `clash-${prefix}-r${roundNumber}-${Math.floor(i / 2) + 1}`,
          };
          matches.push(match);
        }
      }
    }

    return {
      id: `${prefix}-round-${roundNumber}`,
      byes,
      matches,
    };
  }

  private createPlaceholderParticipants(
    byes: Participant[],
    matches: Match[],
    totalNeeded: number,
    typePrefix: "winner" | "loser"
  ): Participant[] {
    const participants: Participant[] = [];

    participants.push(...byes);

    for (let i = 0; i < matches.length && participants.length < totalNeeded; i++) {
      const placeholderParticipant: Participant = {
        id: `${typePrefix}-${matches[i].id}`,
        name: `Winner of ${matches[i].party1?.name} vs ${matches[i].party2?.name}`,
        seed: Math.min(
          matches[i].party1?.seed || 999,
          matches[i].party2?.seed || 999
        ),
        type: "placeholder",
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

  private calculateWinnersRoundsNeeded(participantCount: number): number {
    const nextPowerOf2 = this.getNextPowerOf2(participantCount);
    let rounds = 0;
    let remaining = nextPowerOf2;

    while (remaining > 1) {
      remaining = remaining / 2;
      rounds++;
    }

    return rounds;
  }

  private getWinnersRoundMatchCount(participantCount: number, roundNumber: number): number {
    const nextPowerOf2 = this.getNextPowerOf2(participantCount);
    const totalByes = nextPowerOf2 - participantCount;
    
    if (roundNumber === 1) {
      const playingParticipants = participantCount - totalByes;
      return Math.floor(playingParticipants / 2);
    }

    const previousRoundMatches = this.getWinnersRoundMatchCount(participantCount, roundNumber - 1);
    return Math.floor((totalByes + previousRoundMatches) / 2);
  }

  getRoundName(roundNumber: number, totalRounds: number, bracketType: string): string {
    if (bracketType === "winners") {
      if (roundNumber === totalRounds) return "Winners Final";
      if (roundNumber === 1) return "Winners Round 1";
      return `Winners Round ${roundNumber}`;
    } else if (bracketType === "losers") {
      return `Losers Round ${roundNumber}`;
    } else {
      if (roundNumber === 1) return "Grand Final";
      return "Grand Final (Bracket Reset)";
    }
  }
}