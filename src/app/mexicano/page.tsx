"use client";

import React from "react";
import { MexicanoClassicService } from "@/services/mexicano-classic.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Participant } from "@/types/tournament.types";

const BracketPage = () => {
  const mexicanoService = new MexicanoClassicService();

  // Example participants data
  const participants: Participant[] = [
    { id: "1", name: "Alice Johnson", seed: 1, type: "individual" },
    { id: "2", name: "Bob Smith", seed: 2, type: "individual" },
    { id: "3", name: "Charlie Brown", seed: 3, type: "individual" },
    { id: "4", name: "Diana Prince", seed: 4, type: "individual" },
    { id: "5", name: "Ethan Hunt", seed: 5, type: "individual" },
    { id: "6", name: "Fiona Gallagher", seed: 6, type: "individual" },
    { id: "7", name: "George Clooney", seed: 7, type: "individual" },
    { id: "8", name: "Hannah Montana", seed: 8, type: "individual" },
  ];

  const pools = mexicanoService.generatePools(participants, 0);

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Mexicano Brackets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Below are the brackets generated for the Mexicano format.
          </p>
        </CardContent>
      </Card>

      {pools.map((pool) => (
        <Card key={pool.id} className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{pool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pool.rounds.map((round, index) => (
                <div key={round.id}>
                  <h4 className="text-lg mb-2 font-semibold">
                    Round {index + 1}
                  </h4>
                  <div className="p-4 border-2 mb-2 rounded-md">
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className="grid grid-cols-3 text-sm items-center text-center"
                      >
                        <div>
                          {match.party1.type === "team" &&
                            match.party1.members
                              .map((member) => ` ${member.name}`)
                              .join(" / ")}
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div>
                          {match.party2.type === "team" &&
                            match.party2.members
                              .map((member) => ` ${member.name}`)
                              .join(" / ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BracketPage;
