import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings, Users } from 'lucide-react';
import { useWorkflowContext } from '@/context/WorkflowContext';

export const RubricWaitingView: React.FC = () => {
  const { currentPhase, isPhaseComplete } = useWorkflowContext();
  
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">
            📏 Evaluation Criteria Being Prepared
          </CardTitle>
          <CardDescription className="text-base">
            The facilitator is creating the evaluation rubric that will be used to rate traces.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">What happens next:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isPhaseComplete('discovery') ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {isPhaseComplete('discovery') ? '✓' : '1'}
                </div>
                <span className={`text-sm ${isPhaseComplete('discovery') ? 'text-green-700' : 'text-slate-600'}`}>
                  Discovery insights collected {isPhaseComplete('discovery') ? '(Complete)' : '(In Progress)'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentPhase === 'rubric' ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {currentPhase === 'rubric' ? <Clock className="h-3 w-3" /> : '2'}
                </div>
                <span className={`text-sm ${currentPhase === 'rubric' ? 'text-amber-700 font-medium' : 'text-slate-600'}`}>
                  Facilitator creates evaluation criteria {currentPhase === 'rubric' ? '(Current)' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-300 text-slate-600">
                  3
                </div>
                <span className="text-sm text-slate-600">
                  Facilitator shares screen to explain rubric
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-300 text-slate-600">
                  4
                </div>
                <span className="text-sm text-slate-600">
                  Annotation phase begins
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              You'll be notified when ready to proceed
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};