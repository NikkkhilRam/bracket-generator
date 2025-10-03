import React from "react";
import { Button } from "./ui/button";
import { Pool, Stage, Participant, Match, Round } from "@/types/tournament.types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SingleEliminationService } from "@/services/single-elimination.service";
import { DoubleEliminationService } from "@/services/double-elimination.service";
import { getFormatByName } from "@/services";

type SingleStageFormat =
  | "single-elimination"
  | "round-robin"
  | "double-elimination"
  | "swiss"
  | "americano"
  | "mexicano";
type MultiStageFormat = "round-robin" | "single-elimination" | "swiss";

interface SingleStageFormProps {
  participantCount: number;
  singleStageFormat: SingleStageFormat;
  setSingleStageFormat: (format: SingleStageFormat) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const SingleStageForm: React.FC<SingleStageFormProps> = ({
  participantCount,
  singleStageFormat,
  setSingleStageFormat,
  onSubmit,
  onCancel,
}) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-lg">Single Stage Tournament</CardTitle>
      <p className="text-sm text-muted-foreground">
        {participantCount} participants will enter this final stage.
      </p>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select
            value={singleStageFormat}
            onValueChange={(value) =>
              setSingleStageFormat(value as SingleStageFormat)
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
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Generate Stage</Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

interface MultiStageFormProps {
  participantCount: number;
  multiStageFormat1: MultiStageFormat;
  setMultiStageFormat1: (format: MultiStageFormat) => void;
  multiStageFormat2: SingleStageFormat;
  setMultiStageFormat2: (format: SingleStageFormat) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const MultiStageForm: React.FC<MultiStageFormProps> = ({
  participantCount,
  multiStageFormat1,
  setMultiStageFormat1,
  multiStageFormat2,
  setMultiStageFormat2,
  onSubmit,
  onCancel,
}) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-lg">Two Stage Ladder Tournament</CardTitle>
      <p className="text-sm text-muted-foreground">
        {participantCount} participants will be divided into 2 stages.
      </p>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Stage 1: Qualifier Format
          </label>
          <Select
            value={multiStageFormat1}
            onValueChange={(value) =>
              setMultiStageFormat1(value as MultiStageFormat)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round-robin">Round Robin</SelectItem>
              <SelectItem value="single-elimination">
                Single Elimination
              </SelectItem>
              <SelectItem value="swiss">Swiss System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Will qualify approximately half of the participants.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stage 2: Final Format</label>
          <Select
            value={multiStageFormat2}
            onValueChange={(value) =>
              setMultiStageFormat2(value as SingleStageFormat)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-elimination">
                Single Elimination
              </SelectItem>
              <SelectItem value="double-elimination">
                Double Elimination
              </SelectItem>
              <SelectItem value="round-robin">Round Robin</SelectItem>
              <SelectItem value="swiss">Swiss System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Will qualify exactly 1 winner.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Generate 2 Stages</Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

interface PoolConfigurationProps {
  format: SingleStageFormat;
  poolCount: number;
  maxPools: number;
  onPoolCountChange: (value: number) => void;
  poolDistribution: number[];
  poolValidation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const PoolConfiguration: React.FC<PoolConfigurationProps> = ({
  format,
  poolCount,
  maxPools,
  onPoolCountChange,
  poolDistribution,
  poolValidation,
}) => {
  if (format !== "round-robin" && format !== "americano") return null;

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
          onChange={(e) => onPoolCountChange(Number(e.target.value))}
          required
        />
        <p className="text-xs text-muted-foreground">
          {format === "americano" 
            ? "Each pool must have at least 4 participants" 
            : "Each pool must have at least 2 participants"}
        </p>
      </div>

      {poolDistribution.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Pool Distribution</label>
          <div className="flex flex-wrap gap-2">
            {poolDistribution.map((size, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {format === "americano" ? "Pool" : "Group"} {String.fromCharCode(65 + index)}: {size} participants
              </Badge>
            ))}
          </div>
        </div>
      )}

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

interface SwissConfigurationProps {
  format: SingleStageFormat;
  roundCount: number;
  onRoundCountChange: (value: number) => void;
  defaultRounds: number;
  maxRounds: number;
  minRounds: number;
  swissValidation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const SwissConfiguration: React.FC<SwissConfigurationProps> = ({
  format,
  roundCount,
  onRoundCountChange,
  defaultRounds,
  maxRounds,
  minRounds,
  swissValidation,
}) => {
  if (format !== "swiss") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Number of Rounds
          <span className="text-xs text-muted-foreground ml-2">
            (Recommended: {defaultRounds}, Max: {maxRounds})
          </span>
        </label>
        <Input
          type="number"
          min={minRounds}
          max={maxRounds}
          value={roundCount}
          onChange={(e) => onRoundCountChange(Number(e.target.value))}
          required
        />
        <p className="text-xs text-muted-foreground">
          Players are paired based on their current standings each round
        </p>
      </div>

      {swissValidation.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-sm text-yellow-800">
            <ul className="list-disc list-inside space-y-1">
              {swissValidation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {swissValidation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside space-y-1">
              {swissValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

interface WildcardSelectorProps {
  availableWildcards: Participant[];
  selectedWildcards: string[];
  onWildcardToggle: (wildcardId: string) => void;
  totalParticipantCount: number;
}

export const WildcardSelector: React.FC<WildcardSelectorProps> = ({
  availableWildcards,
  selectedWildcards,
  onWildcardToggle,
  totalParticipantCount,
}) => {
  if (availableWildcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Wildcards (Optional)
        <span className="text-xs text-muted-foreground ml-2">
          ({availableWildcards.length} available)
        </span>
      </label>
      <div className="border rounded-lg p-3 space-y-2 bg-amber-50">
        {availableWildcards.map((wildcard) => (
          <div key={wildcard.id} className="flex items-center space-x-2">
            <Checkbox
              id={wildcard.id}
              checked={selectedWildcards.includes(wildcard.id)}
              onCheckedChange={() => onWildcardToggle(wildcard.id)}
            />
            <label
              htmlFor={wildcard.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {wildcard.name}
              <Badge variant="outline" className="ml-2 text-xs bg-amber-100">
                WC
              </Badge>
            </label>
          </div>
        ))}
      </div>
      {selectedWildcards.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedWildcards.length} wildcard(s) selected. Total participants:{" "}
          {totalParticipantCount}
        </p>
      )}
    </div>
  );
};

interface QualifierInputProps {
  format: SingleStageFormat;
  qualifiers: number;
  totalParticipantCount: number;
  onQualifiersChange: (value: number) => void;
  validSingleEliminationOptions: number[];
}

export const QualifierInput: React.FC<QualifierInputProps> = ({
  format,
  qualifiers,
  totalParticipantCount,
  onQualifiersChange,
  validSingleEliminationOptions,
}) => {
  if (format === "single-elimination") {
    return (
      <Select
        value={qualifiers.toString()}
        onValueChange={(value) => onQualifiersChange(Number(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select qualifiers" />
        </SelectTrigger>
        <SelectContent>
          {validSingleEliminationOptions.map((value) => (
            <SelectItem key={value} value={value.toString()}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (format === "double-elimination" || format === "americano" || format === "mexicano") {
    return (
      <Input
        type="number"
        value={1}
        disabled
        className="bg-gray-100"
        readOnly
      />
    );
  }

  return (
    <Input
      type="number"
      min={0}
      max={totalParticipantCount}
      value={qualifiers}
      onChange={(e) => onQualifiersChange(Number(e.target.value))}
      required
    />
  );
};

interface BracketViewProps {
  stage: Stage;
  poolIndex: number;
}

export const BracketView: React.FC<BracketViewProps> = ({
  stage,
  poolIndex,
}) => {
  const pool = stage.pools[poolIndex];
  if (!pool) return null;

  const service = getFormatByName(stage.format);

  let totalRounds = 0;
  if (
    stage.format === "single-elimination" &&
    service instanceof SingleEliminationService
  ) {
    totalRounds = service.calculateRoundsNeeded(
      stage.participants.length,
      stage.qualifiers
    );
  } else if (
    stage.format === "double-elimination" &&
    service instanceof DoubleEliminationService
  ) {
    totalRounds = pool.rounds.length;
  }

  return (
    <div className="space-y-3">
      {pool.rounds.map((round, roundIndex) => (
        <div key={round.id} className="space-y-2">
          <h4 className="font-medium text-sm">
            {stage.format === "single-elimination"
              ? (service as SingleEliminationService).getRoundName(
                  roundIndex + 1,
                  totalRounds,
                  stage.qualifiers
                )
              : stage.format === "double-elimination"
              ? (service as DoubleEliminationService).getRoundName(
                  roundIndex + 1,
                  totalRounds,
                  pool.id === "pool-winners"
                    ? "winners"
                    : pool.id === "pool-losers"
                    ? "losers"
                    : "grand-final"
                )
              : `Round ${roundIndex + 1}`}
          </h4>

          {round.byes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="flex flex-wrap gap-1">
                Byes:{" "}
                {round.byes.map((bye, idx) => (
                  <span key={bye.id} className="inline-flex items-center gap-1">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {round.matches.map((match) => (
              <div key={match.id} className="border rounded p-2 text-xs">
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
    </div>
  );
};