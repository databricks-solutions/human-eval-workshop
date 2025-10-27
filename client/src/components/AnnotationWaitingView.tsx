import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { useWorkflowContext } from '@/context/WorkflowContext';

export const AnnotationWaitingView: React.FC = () => {
  const { currentPhase, isPhaseComplete } = useWorkflowContext();
  
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">
            ⏳ Annotation Phase Not Ready
          </CardTitle>
          <CardDescription className="text-base">
            The facilitator is preparing the annotation phase. You'll be able to rate traces once everything is ready.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Requirements for annotation:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isPhaseComplete('discovery') 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {isPhaseComplete('discovery') ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <span className={`text-sm ${
                  isPhaseComplete('discovery') ? 'text-green-700' : 'text-slate-600'
                }`}>
                  Discovery insights have been collected
                  {isPhaseComplete('discovery') && <span className="ml-1 font-medium">✓</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isPhaseComplete('rubric') 
                    ? 'bg-green-500 text-white' 
                    : currentPhase === 'rubric' 
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                }`}>
                  {isPhaseComplete('rubric') ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <span className={`text-sm ${
                  isPhaseComplete('rubric') 
                    ? 'text-green-700' 
                    : currentPhase === 'rubric'
                      ? 'text-amber-700 font-medium'
                      : 'text-slate-600'
                }`}>
                  Evaluation rubric has been created
                  {isPhaseComplete('rubric') && <span className="ml-1 font-medium">✓</span>}
                  {currentPhase === 'rubric' && <span className="ml-1 font-medium">(In Progress)</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentPhase === 'annotation' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  <Clock className="h-3 w-3" />
                </div>
                <span className={`text-sm ${
                  currentPhase === 'annotation' ? 'text-purple-700 font-medium' : 'text-slate-600'
                }`}>
                  Facilitator starts the annotation phase
                  {currentPhase === 'annotation' && <span className="ml-1 font-medium">(Ready!)</span>}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className={`${
              currentPhase === 'annotation' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="h-3 w-3 mr-1" />
              {currentPhase === 'annotation' 
                ? 'Annotation phase is starting!' 
                : `Current status: ${currentPhase === 'rubric' ? 'Creating evaluation criteria' : 'Waiting for setup'}`}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};