"use client"
import { tournamentFixture } from "@/lib/data"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { Track } from "@/types/tournament.types"
import TrackView from "@/components/track-view"
import { ArrowLeft, ChevronRight, Trophy } from "lucide-react"

const HomePage = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  useEffect(() => {
    console.log(selectedTrack)
  }, [selectedTrack])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="border-2 border-primary/10 bg-card shadow-lg">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <Trophy color="#5489CC"/>
                <CardTitle className="text-3xl text-primary font-bold tracking-tight sm:text-4xl">
                  {tournamentFixture.name}
                </CardTitle>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tournamentFixture.description}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Content Section */}
        {!selectedTrack ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">Available Tracks</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {tournamentFixture.tracks.length}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tournamentFixture.tracks.map((track) => (
                <Card
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className="group cursor-pointer border-2 border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader className="space-y-3 pb-4">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {track.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Separator className="bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-muted-foreground">{track.type}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <ChevronRight />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setSelectedTrack(null)}
              className="group gap-2 border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Tracks
            </Button>
            <TrackView
              callback={() => setSelectedTrack(null)}
              selectedTrack={selectedTrack}
              setSelectedTrack={setSelectedTrack}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
