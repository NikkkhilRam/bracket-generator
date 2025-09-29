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
          type: "individual",
        },
        {
          id: "ind-002",
          name: "Sarah Johnson",
          seed: 2,
          type: "individual",
        },
        {
          id: "ind-003",
          name: "Mike Chen",
          seed: 3,
          type: "individual",
        },
        {
          id: "ind-004",
          name: "Emma Davis",
          seed: 4,
          type: "individual",
        },
        {
          id: "ind-005",
          name: "Alex Wilson",
          seed: 5,
          type: "individual",
        },
        {
          id: "ind-006",
          name: "Lisa Brown",
          seed: 6,
          type: "individual",
        },
        {
          id: "ind-007",
          name: "Jessica Red",
          seed: 7,
          type: "individual",
        },
        {
          id: "ind-008",
          name: "Amanda Silver",
          seed: 8,
          type: "individual",
        },
        {
          id: "ind-009",
          name: "King albon",
          seed: 9,
          type: "individual",
        },
        {
          id: "ind-010",
          name: "Chris Brown",
          seed: 10,
          type: "individual",
        },
        {
          id: "ind-011",
          name: "James Brown",
          seed: 11,
          type: "individual",
        },
        {
          id: "ind-012",
          name: "Michael Brown",
          seed: 12,
          type: "individual",
        },
      ],
      wildcards: [
        {
          id: "wc-001",
          name: "Wild Card Player 1",
          seed: 999,
          type: "wildcard",
        },
        {
          id: "wc-002",
          name: "Wild Card Player 2",
          seed: 999,
          type: "wildcard",
        },
        {
          id: "wc-003",
          name: "Wild Card Player 3",
          seed: 999,
          type: "wildcard",
        },
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
          type: "team",
          members: [
            {
              id: "player-001",
              name: "David Miller",
              seed: 1,
              type: "individual",
            },
            {
              id: "player-002",
              name: "Tom Anderson",
              seed: 2,
              type: "individual",
            },
          ],
        },
        {
          id: "team-002",
          name: "Lightning Bolts",
          seed: 2,
          type: "team",
          members: [
            {
              id: "player-003",
              name: "Rachel Green",
              seed: 1,
              type: "individual",
            },
            {
              id: "player-004",
              name: "Monica Blue",
              seed: 2,
              type: "individual",
            },
          ],
        },
        {
          id: "team-003",
          name: "Fire Dragons",
          seed: 3,
          type: "team",
          members: [
            {
              id: "player-005",
              name: "Kevin White",
              seed: 1,
              type: "individual",
            },
            {
              id: "player-006",
              name: "Steve Black",
              seed: 2,
              type: "individual",
            },
          ],
        },
        {
          id: "team-004",
          name: "Ice Panthers",
          seed: 4,
          type: "team",
          members: [
            {
              id: "player-007",
              name: "Jessica Red",
              seed: 1,
              type: "individual",
            },
            {
              id: "player-008",
              name: "Amanda Silver",
              seed: 2,
              type: "individual",
            },
          ],
        },
      ],
      wildcards: [
        {
          id: "wc-team-001",
          name: "Wild Card Team 1",
          seed: 999,
          type: "team",
          members: [
            {
              id: "wc-player-001",
              name: "Wild Player A",
              seed: 1,
              type: "individual",
            },
            {
              id: "wc-player-002",
              name: "Wild Player B",
              seed: 2,
              type: "individual",
            },
          ],
        },
      ],
      stages: [],
    },
  ],
};