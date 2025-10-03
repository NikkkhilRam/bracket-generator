"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Pool, Stage, Track, Participant } from "@/types/tournament.types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import StageView from "./stage-view";
import {
  getStageParticipantCount,
  validateStageSequence,
  getFormatByName,
} from "@/services";
import { SingleEliminationService } from "@/services/single-elimination.service";
import { RoundRobinService } from "@/services/round-robin.service";
import { DoubleEliminationService } from "@/services/double-elimination.service";
import { SwissService } from "@/services/swiss.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "./ui/badge";
import TrackConfigurationSelector, {
  ConfigurationMode,
} from "./TrackConfigurationSelector";
import {
  SingleStageForm,
  MultiStageForm,
  PoolConfiguration,
  SwissConfiguration,
  WildcardSelector,
  QualifierInput,
  BracketView,
} from "./track-view-components"
import { AmericanoClassicService } from "@/services/americano-classic.service";
import { MexicanoClassicService } from "@/services/mexicano-classic.service";

type SingleStageFormat =
  | "single-elimination"
  | "round-robin"
  | "double-elimination"
  | "swiss"
  | "americano"
  | "mexicano";
type MultiStageFormat = "round-robin" | "single-elimination" | "swiss";

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
  const [configurationMode, setConfigurationMode] =
    useState<ConfigurationMode | null>(
      selectedTrack.stages.length > 0 ? "custom" : null
    );
  const [showForm, setShowForm] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [format, setFormat] = useState<SingleStageFormat>("single-elimination");
  const [qualifiers, setQualifiers] = useState(0);
  const [poolCount, setPoolCount] = useState(1);
  const [roundCount, setRoundCount] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [selectedWildcards, setSelectedWildcards] = useState<string[]>([]);

  const [singleStageFormat, setSingleStageFormat] =
    useState<SingleStageFormat>("single-elimination");
  const [multiStageFormat1, setMultiStageFormat1] =
    useState<MultiStageFormat>("round-robin");
  const [multiStageFormat2, setMultiStageFormat2] =
    useState<SingleStageFormat>("single-elimination");

  const roundRobinService = useMemo(() => new RoundRobinService(), []);
  const singleElimService = useMemo(() => new SingleEliminationService(), []);
  const doubleElimService = useMemo(() => new DoubleEliminationService(), []);
  const swissService = useMemo(() => new SwissService(), []);
  const americanoService = useMemo(() => new AmericanoClassicService(), []);
  const mexicanoService = useMemo(() => new MexicanoClassicService(), []);

  const [poolDistribution, setPoolDistribution] = useState<number[]>([]);
  const [poolValidation, setPoolValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });

  const [swissValidation, setSwissValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });

  const participantCount = getStageParticipantCount(
    selectedTrack,
    selectedTrack.stages.length
  );
  const totalParticipantCount = participantCount + selectedWildcards.length;

  useEffect(() => {
    const validation = validateStageSequence(
      selectedTrack.stages,
      selectedTrack
    );
    setValidationErrors(validation.errors);
  }, [selectedTrack.stages]);

  useEffect(() => {
    if (showForm) {
      if (format === "round-robin") {
        const distribution = roundRobinService.getPoolDistribution(
          totalParticipantCount,
          poolCount
        );
        setPoolDistribution(distribution);

        const validation = roundRobinService.validatePoolSetup(
          totalParticipantCount,
          poolCount
        );
        setPoolValidation(validation);
        setError(validation.valid ? null : validation.errors[0]);
      } else if (format === "swiss") {
        const validation = swissService.validateSwissSetup(
          totalParticipantCount,
          roundCount
        );
        setSwissValidation(validation);
        setError(validation.valid ? null : validation.errors[0]);
      } else if (format === "americano") {
        const service = getFormatByName(format)!;
        const errorMsg = service.getErrorMessage(qualifiers, totalParticipantCount);
        setError(errorMsg);
      } else if (format === "mexicano") {
        const service = getFormatByName(format)!;
        const errorMsg = service.getErrorMessage(qualifiers, totalParticipantCount);
        setError(errorMsg);
      } else if (format === "single-elimination") {
        const service = getFormatByName(format)!;
        if (!service.validateQualifiers(qualifiers, totalParticipantCount)) {
          setError(service.getErrorMessage(qualifiers, totalParticipantCount));
        } else {
          setError(null);
        }
      } else if (format === "double-elimination") {
        const service = getFormatByName(format)!;
        if (!service.validateQualifiers(qualifiers, totalParticipantCount)) {
          setError(service.getErrorMessage(qualifiers, totalParticipantCount));
        } else {
          setError(null);
        }
      } else {
        setError(null);
      }
    }
  }, [
    format,
    poolCount,
    roundCount,
    totalParticipantCount,
    showForm,
    qualifiers,
    roundRobinService,
    swissService,
  ]);

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

  const getAvailableWildcards = () => {
    const usedWildcardIds = new Set<string>();

    selectedTrack.stages.forEach((stage) => {
      stage.wildcards.forEach((wc) => {
        usedWildcardIds.add(wc.id);
      });
    });

    return selectedTrack.wildcards.filter((wc) => !usedWildcardIds.has(wc.id));
  };

  const generateStage = (
    stageName: string,
    stageFormat: SingleStageFormat,
    allStageParticipants: Participant[],
    qualifierCount: number,
    wildcardParticipants: Participant[],
    sequence: number,
    stagePoolCount?: number,
    stageRoundCount?: number
  ): Stage => {
    const service = getFormatByName(stageFormat);
    if (!service) throw new Error(`Unknown format: ${stageFormat}`);

    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: stageName,
      format: stageFormat,
      qualifiers: qualifierCount,
      sequence: sequence,
      participants: allStageParticipants,
      pools: [],
      wildcards: wildcardParticipants,
      roundCount: stageFormat === "swiss" ? stageRoundCount : undefined,
      poolCount: stageFormat === "round-robin" || stageFormat === "americano" ? stagePoolCount : undefined,
    };

    let pools: Pool[] = [];
    if (stageFormat === "round-robin") {
      pools = (service as RoundRobinService).generatePools(
        allStageParticipants,
        newStage.qualifiers,
        stagePoolCount
      );
    } else if (stageFormat === "swiss") {
      pools = (service as SwissService).generatePools(
        allStageParticipants,
        newStage.qualifiers,
        stageRoundCount
      );
    } else if (stageFormat === "americano") {
      pools = (service as AmericanoClassicService).generatePools(
        allStageParticipants,
        newStage.qualifiers,
        stagePoolCount || 1
      );
    } else if (stageFormat === "mexicano") {
      pools = (service as MexicanoClassicService).generatePools(
        allStageParticipants,
        newStage.qualifiers
      );
    } else if (
      stageFormat === "single-elimination" ||
      stageFormat === "double-elimination"
    ) {
      pools = service.generatePools(allStageParticipants, newStage.qualifiers);
    }

    newStage.pools = pools;
    return newStage;
  };

  const updateTrackWithStages = (
    newStages: Stage[],
    wildcardsUsed: string[] = []
  ) => {
    setSelectedTrack({
      ...selectedTrack,
      stages: newStages,
    });
    setConfigurationMode("custom");
    setShowPresetForm(false);
  };

  const handleSelectConfigurationMode = (mode: ConfigurationMode) => {
    if (mode === "custom") {
      setConfigurationMode("custom");
      if (selectedTrack.stages.length === 0) {
        handleAddStage();
      }
    } else {
      setConfigurationMode(mode);
      setShowPresetForm(true);
    }
  };

  const handleSingleStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allParticipants = selectedTrack.participants;
    const finalFormat = singleStageFormat;

    const newStageName = `${finalFormat.replace("-", " ")} Final`;
    const finalQualifiers = finalFormat === "double-elimination" || finalFormat === "americano" || finalFormat === "mexicano" ? 1 : 0;

    if (finalFormat === "double-elimination" && allParticipants.length < 2) {
      alert("Double Elimination requires at least 2 participants.");
      return;
    }

    if (finalFormat === "americano" && allParticipants.length < 4) {
      alert("Americano requires at least 4 players.");
      return;
    }

    if (finalFormat === "mexicano") {
      if (allParticipants.length < 4) {
        alert("Mexicano requires at least 4 players.");
        return;
      }
      if (allParticipants.length % 4 !== 0) {
        alert("Mexicano requires the number of players to be a multiple of 4.");
        return;
      }
    }

    let stage: Stage;
    if (finalFormat === "single-elimination") {
      const nextPowerOf2 = singleElimService.getNextPowerOf2(
        allParticipants.length
      );
      const qualifiers =
        nextPowerOf2 > allParticipants.length ? 1 : allParticipants.length / 2;
      stage = generateStage(
        newStageName,
        finalFormat,
        allParticipants,
        qualifiers,
        [],
        1
      );
    } else if (finalFormat === "swiss") {
      const defaultRounds = swissService.getDefaultRoundCount(
        allParticipants.length
      );
      stage = generateStage(
        newStageName,
        finalFormat,
        allParticipants,
        finalQualifiers,
        [],
        1,
        undefined,
        defaultRounds
      );
    } else if (finalFormat === "americano") {
      const defaultPools = americanoService.getMaxPoolCount(allParticipants.length);
      stage = generateStage(
        newStageName,
        finalFormat,
        allParticipants,
        finalQualifiers,
        [],
        1,
        Math.min(1, defaultPools)
      );
    } else if (finalFormat === "mexicano") {
      stage = generateStage(
        newStageName,
        finalFormat,
        allParticipants,
        finalQualifiers,
        [],
        1
      );
    } else {
      stage = generateStage(
        newStageName,
        finalFormat,
        allParticipants,
        finalQualifiers,
        [],
        1
      );
    }

    updateTrackWithStages([stage]);
  };

  const handleMultiStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initialParticipants = selectedTrack.participants;

    const stage1Name = `Qualifying Stage (${multiStageFormat1.replace(
      "-",
      " "
    )})`;
    const stage1Format = multiStageFormat1;

    const totalParticipants = initialParticipants.length;
    let stage1Qualifiers: number;
    let poolCount1: number | undefined;
    let roundCount1: number | undefined;

    if (stage1Format === "round-robin") {
      stage1Qualifiers = Math.ceil(totalParticipants / 2);
      poolCount1 = roundRobinService.getDefaultPoolCount(totalParticipants);
    } else if (stage1Format === "swiss") {
      stage1Qualifiers = Math.ceil(totalParticipants / 2);
      roundCount1 = swissService.getDefaultRoundCount(totalParticipants);
    } else {
      const target = Math.ceil(totalParticipants / 2);
      const validPowers =
        singleElimService.getValidQualifierRange(totalParticipants).validValues;
      stage1Qualifiers =
        validPowers.find((p) => p >= target) ||
        validPowers[validPowers.length - 1];
    }

    const stage1 = generateStage(
      stage1Name,
      stage1Format,
      initialParticipants,
      stage1Qualifiers,
      [],
      1,
      poolCount1,
      roundCount1
    );

    const stage2ParticipantsCount = stage1.qualifiers;
    const stage2Participants: Participant[] = [];
    for (let i = 0; i < stage2ParticipantsCount; i++) {
      stage2Participants.push({
        id: `placeholder-stage-2-${i + 1}`,
        name: `Qualifier ${i + 1} from ${stage1.name}`,
        seed: i + 1,
        type: "placeholder",
      });
    }

    const stage2Name = `Finals Stage (${multiStageFormat2.replace("-", " ")})`;
    const stage2Format = multiStageFormat2;
    const stage2Qualifiers = stage2Format === "double-elimination" ? 1 : 1;

    if (stage2ParticipantsCount < 2) {
      alert(
        "The qualifying stage must pass at least 2 participants for a final stage."
      );
      return;
    }

    const stage2 = generateStage(
      stage2Name,
      stage2Format,
      stage2Participants,
      stage2Qualifiers,
      [],
      2
    );

    updateTrackWithStages([stage1, stage2]);
  };

  const handleAddStage = () => {
    setShowForm(true);
    setName("");
    setFormat("single-elimination");
    setQualifiers(0);
    setPoolCount(1);
    setRoundCount(3);
    setError(null);
    setSelectedWildcards([]);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedWildcards([]);
  };

  const handleQualifiersChange = (value: number) => {
    setQualifiers(value);
  };

  const handlePoolCountChange = (value: number) => {
    if (format === "round-robin") {
      const maxPools = roundRobinService.getMaxPoolCount(totalParticipantCount);
      const validatedValue = Math.min(Math.max(1, value), maxPools);
      setPoolCount(validatedValue);
    } else if (format === "americano") {
      const maxPools = americanoService.getMaxPoolCount(totalParticipantCount);
      const validatedValue = Math.min(Math.max(1, value), maxPools);
      setPoolCount(validatedValue);
    }
  };

  const handleWildcardToggle = (wildcardId: string) => {
    setSelectedWildcards((prev) => {
      if (prev.includes(wildcardId)) {
        return prev.filter((id) => id !== wildcardId);
      } else {
        return [...prev, wildcardId];
      }
    });
  };

  const canAddStage = () => {
    if (selectedTrack.stages.length === 0) return true;

    const lastStage = selectedTrack.stages[selectedTrack.stages.length - 1];

    if (lastStage.format === "double-elimination" || lastStage.format === "americano" || lastStage.format === "mexicano") {
      return false;
    }

    return lastStage.qualifiers > 1;
  };

  const getNextStageParticipants = () => {
    return getStageParticipantCount(selectedTrack, selectedTrack.stages.length);
  };

  const getValidSingleEliminationQualifiers = () => {
    const options = [];
    for (let i = 1; i <= totalParticipantCount; i *= 2) {
      options.push(i);
    }
    return options;
  };

  const handleCustomStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (error) return;

    if (format === "round-robin" && !poolValidation.valid) {
      setError(poolValidation.errors.join(", "));
      return;
    }

    if (format === "swiss" && !swissValidation.valid) {
      setError(swissValidation.errors.join(", "));
      return;
    }

    const stageIndex = selectedTrack.stages.length;
    const stageParticipants = getStageParticipants(stageIndex);

    const wildcardParticipants = selectedTrack.wildcards.filter((wc) =>
      selectedWildcards.includes(wc.id)
    );

    const allStageParticipants = [
      ...stageParticipants,
      ...wildcardParticipants,
    ];

    const newStage = generateStage(
      name,
      format,
      allStageParticipants,
      qualifiers,
      wildcardParticipants,
      stageIndex + 1,
      poolCount,
      roundCount
    );

    const updatedTrack = {
      ...selectedTrack,
      stages: [...selectedTrack.stages, newStage],
    };

    setSelectedTrack(updatedTrack);
    setShowForm(false);
    setSelectedWildcards([]);
  };

  if (
    selectedTrack.stages.length === 0 &&
    configurationMode !== "custom" &&
    !showPresetForm
  ) {
    return (
      <TrackConfigurationSelector
        onSelectMode={handleSelectConfigurationMode}
        trackName={selectedTrack.name}
      />
    );
  }

  if (showPresetForm) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => {
            setShowPresetForm(false);
            setConfigurationMode(null);
          }}
        >
          Back to Configuration Options
        </Button>

        {configurationMode === "single-stage" && (
          <SingleStageForm
            participantCount={selectedTrack.participants.length}
            singleStageFormat={singleStageFormat}
            setSingleStageFormat={setSingleStageFormat}
            onSubmit={handleSingleStageSubmit}
            onCancel={() => setShowPresetForm(false)}
          />
        )}
        {configurationMode === "multi-stage" && (
          <MultiStageForm
            participantCount={selectedTrack.participants.length}
            multiStageFormat1={multiStageFormat1}
            setMultiStageFormat1={setMultiStageFormat1}
            multiStageFormat2={multiStageFormat2}
            setMultiStageFormat2={setMultiStageFormat2}
            onSubmit={handleMultiStageSubmit}
            onCancel={() => setShowPresetForm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={callback}>
        Back to Tracks
      </Button>
      {selectedTrack.stages.length === 0 && configurationMode && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setConfigurationMode(null)}>
            Change Configuration Mode
          </Button>
        </div>
      )}

      <Card className="shadow-md gap-0">
        <CardHeader>
          <CardTitle className="text-xl">{selectedTrack.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4 text-sm text-muted-foreground capitalize">
            <p>Type: {selectedTrack.type}</p>
            <p>Total Participants: {selectedTrack.participants.length}</p>
            <p>Wildcards Available: {getAvailableWildcards().length}</p>
            <p>Stages: {selectedTrack.stages.length}</p>
            <p>
              Mode:{" "}
              <Badge className="capitalize" variant="secondary">
                {configurationMode || "N/A"}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

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
        const stageParticipantCount = getStageParticipantCount(
          selectedTrack,
          index
        );
        return (
          <div key={stage.id} className="space-y-2">
            <StageView
              stage={stage}
              participantCount={stageParticipantCount + stage.wildcards.length}
              stageNumber={index + 1}
            />

            {stage.wildcards.length > 0 && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-amber-100">
                      Wildcards in this stage
                    </Badge>
                    <p className="text-sm">
                      {stage.wildcards.map((wc) => wc.name).join(", ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {(stage.format === "americano" || stage.format === "mexicano") &&
              stage.pools.length > 0 && (
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-md">
                      {stage.format === "americano" ? "Americano" : "Mexicano"} Format ({stage.pools.length} pool{stage.pools.length !== 1 ? 's' : ''})
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {stage.format === "americano" 
                        ? "Players rotate partners each round in a round-robin style tournament."
                        : "Players form teams dynamically based on standings after the first round."}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stage.pools.map((pool) => (
                      <div
                        key={pool.id}
                        className="border rounded-lg p-3 bg-white"
                      >
                        <h4 className="font-medium text-sm mb-2">
                          {pool.name} ({pool.parties.length} participants)
                        </h4>

                        <div className="text-xs text-muted-foreground mb-3">
                          <p className="flex flex-wrap gap-1">
                            Participants:{" "}
                            {pool.parties.map((p, idx) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1"
                              >
                                {p.name}
                                {p.type === "wildcard" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-amber-100 px-1 py-0"
                                  >
                                    WC
                                  </Badge>
                                )}
                                {idx < pool.parties.length - 1 && ", "}
                              </span>
                            ))}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {pool.rounds.map((round, roundIndex) => (
                            <div key={round.id} className="border rounded-lg p-2 bg-gray-50">
                              <h5 className="font-medium text-xs mb-2">
                                Round {roundIndex + 1}
                                
                                
                              </h5>

                              {round.byes.length > 0 && (
                                <div className="text-xs text-orange-600 mb-2">
                                  <p className="flex flex-wrap gap-1">
                                    Bye:{" "}
                                    {round.byes.map((bye, idx) => (
                                      <span
                                        key={bye.id}
                                        className="inline-flex items-center gap-1"
                                      >
                                        {bye.name}
                                        {bye.type === "wildcard" && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-amber-100 px-1 py-0"
                                          >
                                            WC
                                          </Badge>
                                        )}
                                        {idx < round.byes.length - 1 && ","}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {round.matches.map((match) => (
                                  <div
                                    key={match.id}
                                    className="border rounded p-2 text-xs bg-white"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">Team 1:</span>
                                        {match.party1?.type === "team" && (
                                          <div className="flex flex-wrap gap-1 text-xs">
                                            {(match.party1 as any).members?.map((member: any, idx: number) => (
                                              <span key={member.id}>
                                                {member.name}
                                                {idx === 0 && " & "}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-center text-muted-foreground text-xs">vs</div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">Team 2:</span>
                                        {match.party2?.type === "team" && (
                                          <div className="flex flex-wrap gap-1 text-xs">
                                            {(match.party2 as any).members?.map((member: any, idx: number) => (
                                              <span key={member.id}>
                                                {member.name}
                                                {idx === 0 && " & "}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {match.winner && (
                                      <div className="text-center mt-1 text-green-600 font-medium text-xs">
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

            {(stage.format === "single-elimination" ||
              stage.format === "double-elimination") &&
              stage.pools.length > 0 && (
                <div className="space-y-3">
                  {stage.format === "single-elimination" && (
                    <Card className="bg-gray-50">
                      <CardHeader>
                        <CardTitle className="text-md">
                          Bracket Structure
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <BracketView stage={stage} poolIndex={0} />
                      </CardContent>
                    </Card>
                  )}

                  {stage.format === "double-elimination" && (
                    <>
                      <Card className="bg-green-50">
                        <CardHeader>
                          <CardTitle className="text-md">
                            Winners Bracket
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <BracketView stage={stage} poolIndex={0} />
                        </CardContent>
                      </Card>

                      <Card className="bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-md">
                            Losers Bracket
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <BracketView stage={stage} poolIndex={1} />
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="text-md">Grand Final</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <BracketView stage={stage} poolIndex={2} />
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}

            {stage.format === "swiss" && stage.pools.length > 0 && (
              <Card className="bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-md">
                    Swiss System ({stage.roundCount || 3} rounds)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Players paired by standings each round. First round pairs by
                    seed.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stage.pools[0].rounds.map((round, roundIndex) => (
                    <div
                      key={round.id}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <h4 className="font-medium text-sm mb-2">
                        Round {roundIndex + 1}
                        {roundIndex === 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Seeded Pairing
                          </Badge>
                        )}
                       
                      </h4>

                      {round.byes.length > 0 && (
                        <div className="text-xs text-orange-600 mb-2">
                          <p className="flex flex-wrap gap-1">
                            Bye:{" "}
                            {round.byes.map((bye, idx) => (
                              <span
                                key={bye.id}
                                className="inline-flex items-center gap-1"
                              >
                                {bye.name}
                                {bye.type === "wildcard" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-amber-100 px-1 py-0"
                                  >
                                    WC
                                  </Badge>
                                )}
                                {idx < round.byes.length - 1 && ","}
                              </span>
                            ))}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {round.matches.map((match) => (
                          <div
                            key={match.id}
                            className="border rounded p-2 text-xs bg-gray-50"
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="truncate flex items-center gap-1">
                                {match.party1?.name || "TBD"}
                                {match.party1?.type === "wildcard" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-amber-100 px-1 py-0"
                                  >
                                    WC
                                  </Badge>
                                )}
                              </span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="truncate flex items-center gap-1">
                                {match.party2?.name || "TBD"}
                                {match.party2?.type === "wildcard" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-amber-100 px-1 py-0"
                                  >
                                    WC
                                  </Badge>
                                )}
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

            {stage.format === "round-robin" && stage.pools.length > 0 && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-md">
                    Round Robin Pools ({stage.pools.length} pools)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stage.pools.map((pool) => (
                    <div
                      key={pool.id}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <h4 className="font-medium text-sm mb-2">
                        {pool.name} ({pool.parties.length} participants)
                      </h4>

                      <div className="text-xs text-muted-foreground mb-3">
                        <p className="flex flex-wrap gap-1">
                          Participants:{" "}
                          {pool.parties.map((p, idx) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1"
                            >
                              {p.name}
                              {p.type === "wildcard" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-amber-100 px-1 py-0"
                                >
                                  WC
                                </Badge>
                              )}
                              {idx < pool.parties.length - 1 && ", "}
                            </span>
                          ))}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {pool.rounds.map((round, roundIndex) => (
                          <div key={round.id} className="space-y-1">
                            <h5 className="font-medium text-xs">
                              Round {roundIndex + 1}
                            </h5>

                            {round.byes.length > 0 && (
                              <div className="text-xs text-orange-600 mb-1">
                                <p className="flex flex-wrap gap-1">
                                  Bye:{" "}
                                  {round.byes.map((bye, idx) => (
                                    <span
                                      key={bye.id}
                                      className="inline-flex items-center gap-1"
                                    >
                                      {bye.name}
                                      {bye.type === "wildcard" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-amber-100 px-1 py-0"
                                        >
                                          WC
                                        </Badge>
                                      )}
                                      {idx < round.byes.length - 1 && ","}
                                    </span>
                                  ))}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {round.matches.map((match) => (
                                <div
                                  key={match.id}
                                  className="border rounded p-2 text-xs bg-gray-50"
                                >
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="truncate flex items-center gap-1">
                                      {match.party1?.name || "TBD"}
                                      {match.party1?.type === "wildcard" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-amber-100 px-1 py-0"
                                        >
                                          WC
                                        </Badge>
                                      )}
                                    </span>
                                    <span className="text-muted-foreground">
                                      vs
                                    </span>
                                    <span className="truncate flex items-center gap-1">
                                      {match.party2?.name || "TBD"}
                                      {match.party2?.type === "wildcard" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-amber-100 px-1 py-0"
                                        >
                                          WC
                                        </Badge>
                                      )}
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

      {configurationMode === "custom" &&
        (showForm ? (
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
                {selectedWildcards.length > 0 &&
                  ` + ${selectedWildcards.length} wildcard(s)`}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomStageSubmit} className="space-y-4">
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
                      setFormat(value as SingleStageFormat)
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
                      <SelectItem value="double-elimination">
                        Double Elimination
                      </SelectItem>
                      <SelectItem value="swiss">Swiss System</SelectItem>
                      <SelectItem value="americano">Americano</SelectItem>
                      <SelectItem value="mexicano">Mexicano</SelectItem>
                    </SelectContent>
                  </Select>
                  {format === "double-elimination" && (
                    <p className="text-xs text-amber-600">
                      Note: Double elimination must be the final stage
                      (qualifies 1 winner only)
                    </p>
                  )}
                  {format === "americano" && (
                    <p className="text-xs text-green-600">
                      Note: Americano must be the final stage. Players rotate partners each round.
                    </p>
                  )}
                  {format === "mexicano" && (
                    <p className="text-xs text-green-600">
                      Note: Mexicano must be the final stage. Requires a multiple of 4 players.
                    </p>
                  )}
                  {format === "swiss" && (
                    <p className="text-xs text-purple-600">
                      Swiss system pairs players by standings each round. Ideal
                      for large tournaments.
                    </p>
                  )}
                </div>

                <WildcardSelector
                  availableWildcards={getAvailableWildcards()}
                  selectedWildcards={selectedWildcards}
                  onWildcardToggle={handleWildcardToggle}
                  totalParticipantCount={totalParticipantCount}
                />

                <PoolConfiguration
                  format={format}
                  poolCount={poolCount}
                  maxPools={format === "round-robin" 
                    ? roundRobinService.getMaxPoolCount(totalParticipantCount)
                    : format === "americano"
                    ? americanoService.getMaxPoolCount(totalParticipantCount)
                    : 0}
                  onPoolCountChange={handlePoolCountChange}
                  poolDistribution={poolDistribution}
                  poolValidation={poolValidation}
                />

                <SwissConfiguration
                  format={format}
                  roundCount={roundCount}
                  onRoundCountChange={setRoundCount}
                  defaultRounds={swissService.getDefaultRoundCount(
                    totalParticipantCount
                  )}
                  maxRounds={swissService.getMaxRoundCount(
                    totalParticipantCount
                  )}
                  minRounds={swissService.getMinRoundCount()}
                  swissValidation={swissValidation}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Qualifiers
                    {format === "single-elimination" && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Must be power of 2)
                      </span>
                    )}
                    {format === "double-elimination" && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Fixed at 1 - final stage)
                      </span>
                    )}
                    {(format === "americano" || format === "mexicano") && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Fixed at 1 - final stage)
                      </span>
                    )}
                    {format === "swiss" && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Top players advance)
                      </span>
                    )}
                  </label>
                  <QualifierInput
                    format={format}
                    qualifiers={qualifiers}
                    totalParticipantCount={totalParticipantCount}
                    onQualifiersChange={handleQualifiersChange}
                    validSingleEliminationOptions={getValidSingleEliminationQualifiers()}
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {format === "round-robin" && (
                    <p className="text-xs text-muted-foreground">
                      Range: 0 - {totalParticipantCount}
                    </p>
                  )}
                  {format === "swiss" && (
                    <p className="text-xs text-muted-foreground">
                      Range: 0 - {totalParticipantCount}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !!error ||
                      !name.trim() ||
                      (format === "round-robin" && !poolValidation.valid) ||
                      (format === "swiss" && !swissValidation.valid)
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
                    Next stage will have {getNextStageParticipants()}{" "}
                    participants
                  </p>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {selectedTrack.stages.length > 0 &&
                (selectedTrack.stages[selectedTrack.stages.length - 1]
                  ?.format === "double-elimination" ||
                selectedTrack.stages[selectedTrack.stages.length - 1]
                  ?.format === "americano" ||
                selectedTrack.stages[selectedTrack.stages.length - 1]
                  ?.format === "mexicano") ? (
                  <p>
                    Cannot add more stages - {selectedTrack.stages[selectedTrack.stages.length - 1]?.format} is the final
                    stage
                  </p>
                ) : (
                  <p>
                    Cannot add more stages - previous stage qualifies only{" "}
                    {selectedTrack.stages[selectedTrack.stages.length - 1]
                      ?.qualifiers || 0}{" "}
                    participant(s)
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default TrackView;