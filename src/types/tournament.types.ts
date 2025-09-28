export interface Team {
  id: string;
  name: string;
  seed: number;
  members: [Individual, Individual];
}

export interface Individual {
  id: string;
  name: string;
  seed: number;
}

export type Participant = Individual | Team;

export interface Match {
  id: string;
  party1: Participant;
  party2: Participant;
  winner: Participant | null;
  clashId: string;
}

export interface Round {
  id: string;
  byes: Participant[];
  matches: Match[];
}

export interface Pool {
  id: string;
  name: string;
  parties: Participant[];
  rounds: Round[];
}

export interface Stage {
  id: string;
  name: string;
  participants: Participant[];
  format: "round-robin" | "single-elimination";
  sequence: number;
  pools: Pool[];
  qualifiers: number
}

export interface Track {
  id: string;
  name: string;
  participants: Participant[];
  stages: Stage[];
  type: 'individual' | 'team';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
}
