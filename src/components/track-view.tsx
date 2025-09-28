"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Pool, Stage, Track, Participant } from "@/types/tournament.types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import StageView from "./stage-view";
import StageForm from "./forms/stage-form";
import { getStageParticipantCount, validateStageSequence } from "@/services";
import { SingleEliminationService } from "@/services/single-elimination.service";

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

  useEffect(() => {
    console.log(selectedTrack);
  }, [selectedTrack]);

  const getStageParticipants = (stageIndex: number): Participant[] => {
    if (stageIndex === 0) {
      // First stage uses track participants
      return selectedTrack.participants;
    } else {
      // Subsequent stages use placeholder participants from previous stage
      const previousStage = selectedTrack.stages[stageIndex - 1];
      const qualifiers = previousStage.qualifiers;
      
      // Create placeholder participants for this stage
      const placeholderParticipants: Participant[] = [];
      for (let i = 0; i < qualifiers; i++) {
        placeholderParticipants.push({
          id: `placeholder-stage-${stageIndex}-${i + 1}`,
          name: `Qualifier ${i + 1} from ${previousStage.name}`,
          seed: i + 1,
        });
      }
      
      return placeholderParticipants;
    }
  };

  const handleSubmit = (stage: Stage) => {
    const stageIndex = selectedTrack.stages.length;
    const stageParticipants = getStageParticipants(stageIndex);
    
    const newStage: Stage = {
      ...stage,
      id: crypto.randomUUID(),
      sequence: stageIndex + 1,
      participants: stageParticipants,
    };

    let pools: Pool[] = [];
    
    if (newStage.format === "single-elimination") {
      const service = new SingleEliminationService();
      pools = service.generatePools(stageParticipants, newStage.qualifiers);
      
      // Log the generated pools for debugging
      console.log('Generated single elimination pools:', pools);
      console.log('Stage participants:', stageParticipants);
      console.log('Qualifiers:', newStage.qualifiers);
    }

    newStage.pools = pools;

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
          <div key={stage.id} className="space-y-2">
            <StageView 
              stage={stage} 
              participantCount={participantCount}
              stageNumber={index + 1}
            />
            
            {/* Display bracket information for single elimination */}
            {stage.format === "single-elimination" && stage.pools.length > 0 && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-md">Bracket Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stage.pools[0].rounds.map((round, roundIndex) => (
                    <div key={round.id} className="space-y-2">
                      <h4 className="font-medium text-sm">Round {roundIndex + 1}</h4>
                      
                      {/* Display byes if any */}
                      {round.byes.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p>Byes: {round.byes.map(bye => bye.name).join(", ")}</p>
                        </div>
                      )}
                      
                      {/* Display matches */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {round.matches.map((match) => (
                          <div key={match.id} className="border rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="truncate">{match.party1?.name || "TBD"}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="truncate">{match.party2?.name || "TBD"}</span>
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
          </div>
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