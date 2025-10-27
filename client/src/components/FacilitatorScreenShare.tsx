import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Users } from 'lucide-react';

interface FacilitatorScreenShareProps {
  phase: string;
}

export const FacilitatorScreenShare: React.FC<FacilitatorScreenShareProps> = ({ phase }) => {
  const getPhaseDescription = () => {
    switch (phase.toLowerCase()) {
      case 'intake':
        return 'The facilitator is configuring and loading MLflow traces for the workshop.';
      case 'rubric':
        return 'The facilitator is creating the evaluation criteria for annotations.';
      case 'results':
        return 'The facilitator will present the inter-rater reliability results and insights.';
      case 'judge_tuning':
        return 'The facilitator is fine-tuning the LLM judge based on workshop annotations.';
      case 'dbsql_export':
        return 'The facilitator is exporting the judge configuration to Databricks SQL.';
      default:
        return 'The facilitator is managing this phase of the workshop.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Monitor className="h-20 w-20 text-blue-500" />
                <Users className="h-10 w-10 text-gray-600 absolute -bottom-2 -right-2" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Facilitator-Led Activity
              </h2>
              <p className="text-lg text-gray-600">
                {getPhaseDescription()}
              </p>
              <p className="text-sm text-gray-500">
                The facilitator will share their screen with the group for this part of the workshop.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              💡 <strong>Tip:</strong> You can participate by providing feedback and asking questions during the screen share.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};