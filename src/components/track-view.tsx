"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Pool, Stage, Track, Participant } from "@/types/tournament.types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import StageView from "./stage-view";
import { getStageParticipantCount, validateStageSequence } from "@/services";
import { SingleEliminationService } from "@/services/single-elimination.service";
import { RoundRobinService } from "@/services/round-robin.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "./ui/badge";

interface TrackViewProps {
  callback: () => void;
  selectedTrack: Track;
  setSelectedTrack: (track: Track) => void;
}

const TrackView: React.FC<TrackViewProps> = ({
  callback,
  selectedTrack,
  setSelectedTrack,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [format, setFormat] = useState<"single-elimination" | "round-robin">(
    "single-elimination"
  );
  const [qualifiers, setQualifiers] = useState(0);
  const [poolCount, setPoolCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [roundRobinService] = useState(new RoundRobinService());
  const [poolDistribution, setPoolDistribution] = useState<number[]>([]);
  const [poolValidation, setPoolValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });

  React.useEffect(() => {
    const validation = validateStageSequence(
      selectedTrack.stages,
      selectedTrack
    );
    setValidationErrors(validation.errors);
  }, [selectedTrack.stages]);

  const handleAddStage = () => {
    setShowForm(true);

    setName("");
    setFormat("single-elimination");
    setQualifiers(0);
    setPoolCount(1);
    setError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  useEffect(() => {
    console.log(selectedTrack);
  }, [selectedTrack]);

  const getStageParticipants = (stageIndex: number): Participant[] => {
    if (stageIndex === 0) {
      return selectedTrack.participants;
    } else {
      const previousStage = selectedTrack.stages[stageIndex - 1];
      const qualifiers = previousStage.qualifiers;

      const placeholderParticipants: Participant[] = [];
      for (let i = 0; i < qualifiers; i++) {
        placeholderParticipants.push({
          id: `placeholder-stage-${stageIndex}-${i + 1}`,
          name: `Qualifier ${i + 1} from ${previousStage.name}`,
          seed: i + 1,
          type: "placeholder",
        });
      }

      return placeholderParticipants;
    }
  };

  const participantCount = getStageParticipantCount(
    selectedTrack,
    selectedTrack.stages.length
  );

  useEffect(() => {
    if (format === "round-robin" && showForm) {
      const distribution = roundRobinService.getPoolDistribution(
        participantCount,
        poolCount
      );
      setPoolDistribution(distribution);

      const validation = roundRobinService.validatePoolSetup(
        participantCount,
        poolCount
      );
      setPoolValidation(validation);

      if (poolCount === 1) {
        const defaultPoolCount =
          roundRobinService.getDefaultPoolCount(participantCount);
        setPoolCount(defaultPoolCount);
      }
    }
  }, [format, poolCount, participantCount, showForm]);

  const validateQualifiers = (value: number) => {
    if (format === "single-elimination") {
      const isPowerOf2 = value > 0 && (value & (value - 1)) === 0;
      if (!isPowerOf2 || value > participantCount) {
        setError(
          "Qualifiers must be a power of 2 and not exceed participant count"
        );
      } else {
        setError(null);
      }
    } else {
      if (value < 0) {
        setError("Qualifiers cannot be negative");
      } else if (value > participantCount) {
        setError(
          `Qualifiers cannot exceed ${participantCount} (total participants in this stage)`
        );
      } else {
        setError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (error) return;

    if (format === "round-robin" && !poolValidation.valid) {
      setError(poolValidation.errors.join(", "));
      return;
    }

    const stageIndex = selectedTrack.stages.length;
    const stageParticipants = getStageParticipants(stageIndex);

    const newStage: Stage = {
      id: crypto.randomUUID(),
      name,
      format,
      qualifiers,
      sequence: stageIndex + 1,
      participants: stageParticipants,
      pools: [],
    };

    let pools: Pool[] = [];

    if (newStage.format === "single-elimination") {
      const service = new SingleEliminationService();
      pools = service.generatePools(stageParticipants, newStage.qualifiers);

      console.log("Generated single elimination pools:", pools);
    } else if (newStage.format === "round-robin") {
      const service = new RoundRobinService();
      pools = service.generatePools(
        stageParticipants,
        newStage.qualifiers,
        poolCount
      );

      console.log("Generated round robin pools:", pools);
      console.log("Pool count:", poolCount);
    }

    newStage.pools = pools;

    const updatedTrack = {
      ...selectedTrack,
      stages: [...selectedTrack.stages, newStage],
    };

    setSelectedTrack(updatedTrack);
    setShowForm(false);
  };

  const handleQualifiersChange = (value: number) => {
    setQualifiers(value);
    validateQualifiers(value);
  };

  const handlePoolCountChange = (value: number) => {
    const maxPools = roundRobinService.getMaxPoolCount(participantCount);
    const validatedValue = Math.min(Math.max(1, value), maxPools);
    setPoolCount(validatedValue);
  };

  const canAddStage = () => {
    if (selectedTrack.stages.length === 0) return true;

    const lastStage = selectedTrack.stages[selectedTrack.stages.length - 1];
    return lastStage.qualifiers > 1;
  };

  const getNextStageParticipants = () => {
    return getStageParticipantCount(selectedTrack, selectedTrack.stages.length);
  };

  const getValidSingleEliminationQualifiers = () => {
    const options = [];
    for (let i = 1; i <= participantCount; i *= 2) {
      options.push(i);
    }
    return options;
  };

  const renderQualifierInput = () => {
    if (format === "single-elimination") {
      const validOptions = getValidSingleEliminationQualifiers();
      return (
        <Select
          value={qualifiers.toString()}
          onValueChange={(value) => handleQualifiersChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select qualifiers" />
          </SelectTrigger>
          <SelectContent>
            {validOptions.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type="number"
        min={0}
        max={participantCount}
        value={qualifiers}
        onChange={(e) => handleQualifiersChange(Number(e.target.value))}
        required
      />
    );
  };

  const renderPoolConfiguration = () => {
    if (format !== "round-robin") return null;

    const maxPools = roundRobinService.getMaxPoolCount(participantCount);

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Number of Pools
            <span className="text-xs text-muted-foreground ml-2">
              (Max: {maxPools})
            </span>
          </label>
          <Input
            type="number"
            min={1}
            max={maxPools}
            value={poolCount}
            onChange={(e) => handlePoolCountChange(Number(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Each pool must have at least 2 participants
          </p>
        </div>

        {/* Pool Distribution Preview */}
        {poolDistribution.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Pool Distribution</label>
            <div className="flex flex-wrap gap-2">
              {poolDistribution.map((size, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  Group {String.fromCharCode(65 + index)}: {size} participants
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pool Validation Warnings/Errors */}
        {poolValidation.warnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-sm text-yellow-800">
              <ul className="list-disc list-inside space-y-1">
                {poolValidation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {poolValidation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside space-y-1">
                {poolValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={callback}>
        Back to Tracks
      </Button>

      <Card className="shadow-md gap-0">
        <CardHeader>
          <CardTitle className="text-xl">{selectedTrack.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4 text-sm text-muted-foreground capitalize">
            <p>Type: {selectedTrack.type}</p>
            <p>Total Participants: {selectedTrack.participants.length}</p>
            <p>Stages: {selectedTrack.stages.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Validation Issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {selectedTrack.stages.map((stage, index) => {
        const participantCount = getStageParticipantCount(selectedTrack, index);
        return (
          <div key={stage.id} className="space-y-2">
            <StageView
              stage={stage}
              participantCount={participantCount}
              stageNumber={index + 1}
            />

            {/* Display bracket information for single elimination */}
            {stage.format === "single-elimination" &&
              stage.pools.length > 0 && (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-md">Bracket Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stage.pools[0].rounds.map((round, roundIndex) => (
                      <div key={round.id} className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Round {roundIndex + 1}
                        </h4>

                        {/* Display byes if any */}
                        {round.byes.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <p>
                              Byes:{" "}
                              {round.byes.map((bye) => bye.name).join(", ")}
                            </p>
                          </div>
                        )}

                        {/* Display matches */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {round.matches.map((match) => (
                            <div
                              key={match.id}
                              className="border rounded p-2 text-xs"
                            >
                              <div className="flex justify-between items-center">
                                <span className="truncate">
                                  {match.party1?.name || "TBD"}
                                </span>
                                <span className="text-muted-foreground">
                                  vs
                                </span>
                                <span className="truncate">
                                  {match.party2?.name || "TBD"}
                                </span>
                              </div>
                              {match.winner && (
                                <div className="text-center mt-1 text-green-600 font-medium">
                                  Winner: {match.winner.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* Display pool information for round robin */}
            {stage.format === "round-robin" && stage.pools.length > 0 && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-md">
                    Round Robin Pools ({stage.pools.length} pools)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stage.pools.map((pool, poolIndex) => (
                    <div
                      key={pool.id}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <h4 className="font-medium text-sm mb-2">
                        {pool.name} ({pool.parties.length} participants)
                      </h4>

                      {/* Pool participants */}
                      <div className="text-xs text-muted-foreground mb-3">
                        <p>
                          Participants:{" "}
                          {pool.parties.map((p) => p.name).join(", ")}
                        </p>
                      </div>

                      {/* Pool rounds and matches */}
                      <div className="space-y-2">
                        {pool.rounds.map((round, roundIndex) => (
                          <div key={round.id} className="space-y-1">
                            <h5 className="font-medium text-xs">
                              Round {roundIndex + 1}
                            </h5>

                            {/* Display byes if any */}
                            {round.byes.length > 0 && (
                              <div className="text-xs text-orange-600 mb-1">
                                <p>
                                  Bye:{" "}
                                  {round.byes.map((bye) => bye.name).join(", ")}
                                </p>
                              </div>
                            )}

                            {/* Display matches */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {round.matches.map((match) => (
                                <div
                                  key={match.id}
                                  className="border rounded p-2 text-xs bg-gray-50"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="truncate">
                                      {match.party1?.name || "TBD"}
                                    </span>
                                    <span className="text-muted-foreground">
                                      vs
                                    </span>
                                    <span className="truncate">
                                      {match.party2?.name || "TBD"}
                                    </span>
                                  </div>
                                  {match.winner && (
                                    <div className="text-center mt-1 text-green-600 font-medium">
                                      Winner: {match.winner.name}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}

      {/* Stage Form */}
      {showForm ? (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              Add Stage {selectedTrack.stages.length + 1}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This stage will have {participantCount} participant
              {participantCount !== 1 ? "s" : ""}
              {selectedTrack.stages.length > 0 &&
                ` (qualified from previous stage)`}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage Name</label>
                <Input
                  placeholder="Enter stage name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select
                  value={format}
                  onValueChange={(value) =>
                    setFormat(value as "single-elimination" | "round-robin")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-elimination">
                      Single Elimination
                    </SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pool Configuration for Round Robin */}
              {renderPoolConfiguration()}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Qualifiers
                  {format === "single-elimination" && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Must be power of 2)
                    </span>
                  )}
                </label>
                {renderQualifierInput()}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {format === "round-robin" && (
                  <p className="text-xs text-muted-foreground">
                    Range: 0 - {participantCount}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !!error ||
                    !name.trim() ||
                    (format === "round-robin" && !poolValidation.valid)
                  }
                >
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {canAddStage() ? (
            <>
              <Button onClick={handleAddStage}>
                Add Stage {selectedTrack.stages.length + 1}
              </Button>
              {selectedTrack.stages.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Next stage will have {getNextStageParticipants()} participants
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>
                Cannot add more stages - previous stage qualifies only{" "}
                {selectedTrack.stages[selectedTrack.stages.length - 1]
                  ?.qualifiers || 0}{" "}
                participant(s)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackView;
