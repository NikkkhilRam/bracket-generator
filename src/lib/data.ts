import { Tournament } from "@/types/tournament.types";

export const tournamentFixture: Tournament = {
  id: "tournament-001",
  name: "Championship Tournament 2024",
  description:
    "Annual championship tournament featuring individual and team competitions",
  tracks: [
    {
      id: "track-individual",
      name: "Singles Track",
      type: "individual",
      participants: [
        {
          id: "ind-001",
          name: "John Smith",
          seed: 1,
        },
        {
          id: "ind-002",
          name: "Sarah Johnson",
          seed: 2,
        },
        {
          id: "ind-003",
          name: "Mike Chen",
          seed: 3,
        },
        {
          id: "ind-004",
          name: "Emma Davis",
          seed: 4,
        },
        {
          id: "ind-005",
          name: "Alex Wilson",
          seed: 5,
        },
        {
          id: "ind-006",
          name: "Lisa Brown",
          seed: 6,
        },
        {
            id: "ind-007",
            name: "Jessica Red",
            seed: 7
        },
        {
            id: "ind-008",
            name: "Amanda Silver",
            seed: 8
        },
        {
            id: "ind-009",
            name: "Alex Wilson",
            seed: 9
        },  
        {
            id: "ind-010",
            name: "Lisa Brown",
            seed: 10
        }
      ],
      stages: [],
    },
    {
      id: "track-team",
      name: "Doubles Track",
      type: "team",
      participants: [
        {
          id: "team-001",
          name: "Thunder Hawks",
          seed: 1,
          members: [
            {
              id: "player-001",
              name: "David Miller",
              seed: 1,
            },
            {
              id: "player-002",
              name: "Tom Anderson",
              seed: 2,
            },
          ],
        },
        {
          id: "team-002",
          name: "Lightning Bolts",
          seed: 2,
          members: [
            {
              id: "player-003",
              name: "Rachel Green",
              seed: 1,
            },
            {
              id: "player-004",
              name: "Monica Blue",
              seed: 2,
            },
          ],
        },
        {
          id: "team-003",
          name: "Fire Dragons",
          seed: 3,
          members: [
            {
              id: "player-005",
              name: "Kevin White",
              seed: 1,
            },
            {
              id: "player-006",
              name: "Steve Black",
              seed: 2,
            },
          ],
        },
        {
          id: "team-004",
          name: "Ice Panthers",
          seed: 4,
          members: [
            {
              id: "player-007",
              name: "Jessica Red",
              seed: 1,
            },
            {
              id: "player-008",
              name: "Amanda Silver",
              seed: 2,
            },
          ],
        },
      ],
      stages: [],
    },
  ],
};
