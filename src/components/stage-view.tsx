import { Stage } from "@/types/tournament.types";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface StageViewProps {
  stage: Stage;
  participantCount: number;
  stageNumber: number;
}

const StageView: React.FC<StageViewProps> = ({ 
  stage, 
  participantCount, 
  stageNumber 
}) => {
  const getStageTypeColor = (format: string) => {
    switch (format) {
      case "single-elimination":
        return "bg-red-100 text-red-800 border-red-200";
      case "round-robin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "double-elimination":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "swiss":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getQualifierRatio = () => {
    if (participantCount === 0) return "0/0";
    return `${stage.qualifiers}/${participantCount}`;
  };

  const getEliminationInfo = () => {
    const eliminated = participantCount - stage.qualifiers;
    return eliminated > 0 ? eliminated : 0;
  };

  const getFormatDisplayName = (format: string) => {
    switch (format) {
      case "single-elimination":
        return "Single Elimination";
      case "round-robin":
        return "Round Robin";
      case "double-elimination":
        return "Double Elimination";
      case "swiss":
        return "Swiss System";
      default:
        return format;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Stage {stageNumber}: {stage.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={getStageTypeColor(stage.format)}
          >
            {getFormatDisplayName(stage.format)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Participants</p>
            <p className="font-medium">{participantCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Qualifiers</p>
            <p className="font-medium text-green-600">
              {stage.qualifiers} 
              <span className="text-muted-foreground ml-1">
                ({getQualifierRatio()})
              </span>
            </p>
          </div>
        </div>
        
        {stage.format === "swiss" && stage.roundCount && (
          <div className="text-xs text-muted-foreground bg-purple-50 p-2 rounded">
            <span className="text-purple-700 font-medium">
              {stage.roundCount} Swiss rounds - players paired by standings each round
            </span>
          </div>
        )}
        
        {getEliminationInfo() > 0 && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <span className="text-red-600 font-medium">
              {getEliminationInfo()} participant{getEliminationInfo() !== 1 ? 's' : ''} eliminated
            </span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sequence: {stage.sequence}</span>
          {stage.format === "single-elimination" && (
            <span>Power of 2 required</span>
          )}
          {stage.format === "swiss" && (
            <span>Standings-based pairing</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StageView;