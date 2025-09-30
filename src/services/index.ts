import { Participant, Stage, Track } from "@/types/tournament.types";
import { FormatService } from "./format-service";
import { RoundRobinService } from "./round-robin.service";
import { SingleEliminationService } from "./single-elimination.service";
import { DoubleEliminationService } from "./double-elimination.service";
import { SwissService } from "./swiss.service";

const services: FormatService[] = [
  new RoundRobinService(),
  new SingleEliminationService(),
  new DoubleEliminationService(),
  new SwissService(),
];

export const formats: Record<string, FormatService> = Object.fromEntries(
  services.map((s) => [s.name, s])
);

export function getFormatByName(name: string): FormatService | null {
  return formats[name] || null;
}

export function getStageParticipants(
  track: Track,
  stageIndex: number
): Participant[] {
  if (stageIndex === 0) {
    return track.participants;
  }

  const previousStage = track.stages[stageIndex - 1];
  return previousStage ? Array(previousStage.qualifiers).fill(null) : [];
}

export function getStageParticipantCount(
  track: Track,
  stageIndex: number
): number {
  return getStageParticipants(track, stageIndex).length;
}

export function validateStageSequence(
  stages: Stage[],
  track: Track
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const participantCount = getStageParticipantCount(track, i);

    if (participantCount === 0 && i > 0) {
      errors.push(
        `Stage ${i + 1} (${stage.name}) has no participants from previous stage`
      );
      continue;
    }

    const service = getFormatByName(stage.format);
    if (
      service &&
      !service.validateQualifiers(stage.qualifiers, participantCount)
    ) {
      const errorMsg = service.getErrorMessage(
        stage.qualifiers,
        participantCount
      );
      errors.push(`Stage ${i + 1} (${stage.name}): ${errorMsg}`);
    }

    if (stage.format === "double-elimination" && i < stages.length - 1) {
      errors.push(
        `Stage ${i + 1} (${stage.name}): Double elimination must be the final stage`
      );
    }

    if (i < stages.length - 1) {
      const nextStage = stages[i + 1];
      if (stage.qualifiers === 0 && nextStage) {
        errors.push(
          `Stage ${i + 1} (${
            stage.name
          }) qualifies 0 participants, but has a following stage`
        );
      }
      if (stage.qualifiers === 1 && nextStage && stage.format !== "double-elimination") {
        errors.push(
          `Stage ${i + 1} (${
            stage.name
          }) qualifies only 1 participant, but has a following stage`
        );
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}