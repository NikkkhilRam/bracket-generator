"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Stage, Track } from "@/types/tournament.types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import StageView from "./stage-view";
import StageForm from "./forms/stage-form";
import { getStageParticipantCount, validateStageSequence } from "@/services";

interface TrackViewProps {
  callback: () => void;
  selectedTrack: Track;
  setSelectedTrack: (track: Track) => void;
}

const TrackView: React.FC<TrackViewProps> = ({ 
  callback, 
  selectedTrack, 
  setSelectedTrack 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate current stage sequence
  React.useEffect(() => {
    const validation = validateStageSequence(selectedTrack.stages, selectedTrack);
    setValidationErrors(validation.errors);
  }, [selectedTrack.stages]);

  const handleAddStage = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmit = (stage: Stage) => {
    const newStage: Stage = {
      ...stage,
      id: crypto.randomUUID(),
      sequence: selectedTrack.stages.length + 1,
    };

    const updatedTrack = {
      ...selectedTrack,
      stages: [...selectedTrack.stages, newStage],
    };

    setSelectedTrack(updatedTrack);
    setShowForm(false);
  };

  const canAddStage = () => {
    if (selectedTrack.stages.length === 0) return true;
    
    const lastStage = selectedTrack.stages[selectedTrack.stages.length - 1];
    return lastStage.qualifiers > 1; // Can only add next stage if previous stage qualifies more than 1
  };

  const getNextStageParticipants = () => {
    return getStageParticipantCount(selectedTrack, selectedTrack.stages.length);
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
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {selectedTrack.stages.map((stage, index) => {
        const participantCount = getStageParticipantCount(selectedTrack, index);
        return (
          <StageView 
            key={stage.id} 
            stage={stage} 
            participantCount={participantCount}
            stageNumber={index + 1}
          />
        );
      })}

      {showForm ? (
        <StageForm 
          onCancel={handleCancel} 
          onSubmit={handleSubmit}
          track={selectedTrack}
          stageIndex={selectedTrack.stages.length}
        />
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
              <p>Cannot add more stages - previous stage qualifies only {selectedTrack.stages[selectedTrack.stages.length - 1]?.qualifiers || 0} participant(s)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackView;