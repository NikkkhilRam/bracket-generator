"use client";
import { tournamentFixture } from "@/lib/data";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/tournament.types";
import TrackView from "@/components/track-view";

const HomePage = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">{tournamentFixture.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {tournamentFixture.description}
          </p>
        </CardContent>
      </Card>

      {!selectedTrack ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tracks</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournamentFixture.tracks.map((track) => (
              <Card
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className="cursor-pointer shadow-sm hover:shadow-lg transition"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{track.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground capitalize">
                    {track.type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <TrackView
            callback={() => setSelectedTrack(null)}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
