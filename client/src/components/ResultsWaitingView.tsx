import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Clock, Users } from 'lucide-react';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { useAllTraces, useAnnotations } from '@/hooks/useWorkshopApi';

export const ResultsWaitingView: React.FC = () => {
  const { workshopId } = useWorkshopContext();
  // Use all traces for results waiting view
  const { data: traces } = useAllTraces(workshopId!);
  const { data: annotations } = useAnnotations(workshopId!);
  
  // Calculate annotation progress
  const totalTraces = traces?.length || 0;
  const tracesWithAnnotations = annotations ? new Set(annotations.map(a => a.trace_id)) : new Set();
  const annotationProgress = totalTraces > 0 ? (tracesWithAnnotations.size / totalTraces) * 100 : 0;
  const activeAnnotators = annotations ? new Set(annotations.map(a => a.user_id)).size : 0;
  
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">
            📊 Results Not Yet Available
          </CardTitle>
          <CardDescription className="text-base">
            Results will be shared when annotation is complete. The facilitator will analyze inter-rater reliability and share findings.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Current Progress:</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Traces Annotated</span>
                  <span className="text-sm font-medium text-slate-800">
                    {tracesWithAnnotations.size} of {totalTraces}
                  </span>
                </div>
                <Progress value={annotationProgress} className="h-2" />
                <div className="text-xs text-slate-500 mt-1">
                  {Math.round(annotationProgress)}% Complete
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Active Annotators</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activeAnnotators} contributors
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• Facilitator monitors annotation progress</div>
              <div>• Once targets are met, inter-rater reliability is calculated</div>
              <div>• Results include agreement scores and quality insights</div>
              <div>• Facilitator shares findings with all participants</div>
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Clock className="h-3 w-3 mr-1" />
              {annotationProgress >= 100 
                ? 'Annotation complete - results being prepared!' 
                : 'Waiting for annotation completion'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};