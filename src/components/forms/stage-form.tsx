"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Stage, Track } from "@/types/tournament.types";
import { getFormatByName, getStageParticipantCount } from "@/services";

interface StageFormProps {
  onCancel: () => void;
  onSubmit: (stage: Stage) => void;
  track: Track;
  stageIndex: number;
}

const StageForm: React.FC<StageFormProps> = ({
  onCancel,
  onSubmit,
  track,
  stageIndex,
}) => {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"single-elimination" | "round-robin" | "double-elimination">(
    "single-elimination"
  );
  const [qualifiers, setQualifiers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const participantCount = getStageParticipantCount(track, stageIndex);

  const service = getFormatByName(format);
  const validRange = service?.getValidQualifierRange(participantCount);

  useEffect(() => {
    if (service) {
      const newQualifiers =
        format === "single-elimination"
          ? validRange?.validValues?.[0] || 1
          : format === "double-elimination"
          ? 1
          : Math.min(qualifiers, participantCount);

      setQualifiers(newQualifiers);
      validateQualifiers(newQualifiers);
    }
  }, [format, participantCount]);

  const validateQualifiers = (value: number) => {
    if (!service) return;

    if (!service.validateQualifiers(value, participantCount)) {
      setError(service.getErrorMessage(value, participantCount));
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!service) return;

    if (!service.validateQualifiers(qualifiers, participantCount)) {
      setError(service.getErrorMessage(qualifiers, participantCount));
      return;
    }

    onSubmit({
      name,
      format,
      qualifiers,
      id: "",
      sequence: 0,
      participants: [],
      pools: [],
    });
  };

  const handleQualifiersChange = (value: number) => {
    setQualifiers(value);
    validateQualifiers(value);
  };

  const renderQualifierInput = () => {
    if (format === "single-elimination" && validRange?.validValues) {
      return (
        <Select
          value={qualifiers.toString()}
          onValueChange={(value) => handleQualifiersChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select qualifiers" />
          </SelectTrigger>
          <SelectContent>
            {validRange.validValues.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (format === "double-elimination") {
      return (
        <Input
          type="number"
          value={1}
          disabled
          className="bg-gray-100"
        />
      );
    }

    return (
      <Input
        type="number"
        min={validRange?.min || 0}
        max={validRange?.max || participantCount}
        value={qualifiers}
        onChange={(e) => handleQualifiersChange(Number(e.target.value))}
        required
      />
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Add Stage {stageIndex + 1}</CardTitle>
        <p className="text-sm text-muted-foreground">
          This stage will have {participantCount} participant
          {participantCount !== 1 ? "s" : ""}
          {stageIndex > 0 && ` (qualified from previous stage)`}
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
                setFormat(value as "single-elimination" | "round-robin" | "double-elimination")
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
              </SelectContent>
            </Select>
            {format === "double-elimination" && (
              <p className="text-xs text-amber-600">
                Note: Double elimination must be the final stage (qualifies 1 winner only)
              </p>
            )}
          </div>

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
            </label>
            {renderQualifierInput()}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {format === "round-robin" && (
              <p className="text-xs text-muted-foreground">
                Range: {validRange?.min} - {validRange?.max}
              </p>
            )}
            {format === "single-elimination" && validRange?.validValues && (
              <p className="text-xs text-muted-foreground">
                Valid options: {validRange.validValues.join(", ")}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!!error || !name.trim()}>
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StageForm;