// components/track-configuration-selector.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export type ConfigurationMode = 'single-stage' | 'multi-stage' | 'custom';

interface TrackConfigurationSelectorProps {
  onSelectMode: (mode: ConfigurationMode) => void;
  trackName: string;
}

const TrackConfigurationSelector: React.FC<TrackConfigurationSelectorProps> = ({
  onSelectMode,
  trackName,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Configure Stages for "{trackName}"</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Single Stage */}
        <Card
          className="cursor-pointer shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          onClick={() => onSelectMode('single-stage')}
        >
          <CardHeader>
            <CardTitle className="text-lg">One Stage Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A quick tournament with a single elimination or round-robin stage
              to determine the final winner.
            </p>
            <Button className="w-full" variant="outline">
              Select
            </Button>
          </CardContent>
        </Card>

        {/* Multi Stage */}
        <Card
          className="cursor-pointer shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          onClick={() => onSelectMode('multi-stage')}
        >
          <CardHeader>
            <CardTitle className="text-lg">Two Stage Ladder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A qualifying stage (Round Robin or Single Elimination) followed by a final
              Single or Double Elimination stage.
            </p>
            <Button className="w-full" variant="outline">
              Select
            </Button>
          </CardContent>
        </Card>

        {/* Custom */}
        <Card
          className="cursor-pointer shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          onClick={() => onSelectMode('custom')}
        >
          <CardHeader>
            <CardTitle className="text-lg">Custom Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add and configure each stage manually, including qualifiers, wildcards, and format.
              (Current step-by-step flow)
            </p>
            <Button className="w-full" variant="outline">
              Select
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackConfigurationSelector;