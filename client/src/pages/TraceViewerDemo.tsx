/**
 * TraceViewerDemo Page
 * 
 * Demonstrates the TraceViewer component with real workshop trace data.
 * This shows how the discovery interface will look during workshops.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TraceViewer, TraceData } from '@/components/TraceViewer';
import { TraceDataViewer } from '@/components/TraceDataViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle, Settings, Table, RefreshCw } from 'lucide-react';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { useWorkflowContext } from '@/context/WorkflowContext';
import { toast } from 'sonner';
import { useUser, useRoleCheck } from '@/context/UserContext';
import { useTraces, useUserFindings, useSubmitFinding, refetchAllWorkshopQueries } from '@/hooks/useWorkshopApi';
import { useQueryClient } from '@tanstack/react-query';
import { WorkshopsService } from '@/client';
import type { Trace } from '@/client';

// Convert API trace to TraceData format
const convertTraceToTraceData = (trace: Trace): TraceData => ({
  id: trace.id,
  input: trace.input,
  output: trace.output,
  context: trace.context || undefined,
  mlflow_trace_id: trace.mlflow_trace_id || undefined,
  mlflow_url: trace.mlflow_url || undefined,
  mlflow_host: trace.mlflow_host || undefined,
  mlflow_experiment_id: trace.mlflow_experiment_id || undefined
});

export function TraceViewerDemo() {
  const { workshopId } = useWorkshopContext();
  const { currentPhase } = useWorkflowContext();
  const { user } = useUser();
  const { canCreateFindings, isFacilitator } = useRoleCheck();

  // Check if user is logged in with an ID
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Please Log In
          </div>
          <div className="text-sm text-gray-500 mb-4">
            You must be logged in to view discovery traces.
          </div>
        </div>
      </div>
    );
  }

  // CRITICAL SAFETY CHECK: Facilitators should not see discovery text boxes during discovery/annotation phases
  if (isFacilitator && (currentPhase === 'discovery' || currentPhase === 'annotation')) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Facilitator Dashboard Required
          </div>
          <div className="text-sm text-gray-500 mb-4">
            As a facilitator during the {currentPhase} phase, you should use the monitoring dashboard instead of the participant interface.
          </div>
          <p className="text-xs text-gray-400">
            Please navigate back to access the appropriate facilitator tools for monitoring and managing this phase.
          </p>
        </div>
      </div>
    );
  }
  const [currentTraceIndex, setCurrentTraceIndex] = useState(0);
  const [question1Response, setQuestion1Response] = useState('');
  const [question2Response, setQuestion2Response] = useState('');
  const [submittedFindings, setSubmittedFindings] = useState<Set<string>>(new Set());
  const [isCompletingDiscovery, setIsCompletingDiscovery] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const previousTraceId = useRef<string | null>(null);
  const hasAutoNavigated = useRef(false);
  const previousTraceCount = useRef<number>(0);

  // Fetch data - pass user ID for personalized trace ordering
  // User is guaranteed to have an ID at this point due to early return above
  const { data: traces, isLoading: tracesLoading, error: tracesError } = useTraces(
    workshopId!, 
    user.id  // User ID is required and guaranteed to exist
  );
  const { data: existingFindings } = useUserFindings(workshopId!, user); // Secure user-isolated findings
  const submitFinding = useSubmitFinding(workshopId!);
  const queryClient = useQueryClient();

  // Convert traces to TraceData format - memoize to prevent infinite loops
  const traceData = useMemo(() => {
    return traces?.map(convertTraceToTraceData) || [];
  }, [traces]);
  const currentTrace = traceData[currentTraceIndex];
  
  // Check if discovery phase is complete
  const allTracesHaveFindings = traceData.length > 0 && traceData.every(trace => submittedFindings.has(trace.id));
  const isDiscoveryComplete = allTracesHaveFindings && submittedFindings.size === traceData.length;

  // Track existing findings for current trace and populate responses
  useEffect(() => {
    if (currentTrace?.id && currentTrace.id !== previousTraceId.current) {
      // Check if this trace has an existing finding
      const existingFinding = existingFindings?.find(finding => finding.trace_id === currentTrace.id);
      
      if (existingFinding) {
        // Parse and populate the existing finding text
        const insight = existingFinding.insight || '';
        const parts = insight.split('\n\nImprovement Analysis: ');
        if (parts.length === 2) {
          const qualityPart = parts[0].replace('Quality Assessment: ', '');
          const improvementPart = parts[1];
          setQuestion1Response(qualityPart);
          setQuestion2Response(improvementPart);
        }
      } else {
        // Clear responses for new trace
        setQuestion1Response('');
        setQuestion2Response('');
      }
      
      previousTraceId.current = currentTrace.id;
    }
  }, [currentTrace?.id, existingFindings]);

  // Navigate to first incomplete trace (only on initial load) and handle trace additions
  useEffect(() => {
    if (existingFindings && traceData.length > 0) {
      const validTraceIds = new Set(traceData.map(t => t.id));
      const completedTraceIds = new Set(existingFindings
        .filter(f => validTraceIds.has(f.trace_id))  // Only count findings for current traces
        .map(f => f.trace_id)
      );
      // NOTE: Do NOT call setSubmittedFindings here - handled by separate effect below
      
      // Check if traces were added (count increased)
      const tracesWereAdded = previousTraceCount.current > 0 && traceData.length > previousTraceCount.current;
      
      if (!hasAutoNavigated.current) {
        // Initial load: navigate to first incomplete trace
        const firstIncompleteIndex = traceData.findIndex(trace => !completedTraceIds.has(trace.id));
        if (firstIncompleteIndex !== -1) {
          setCurrentTraceIndex(firstIncompleteIndex);
        } else if (completedTraceIds.size === traceData.length) {
          // All traces completed, show last one
          setCurrentTraceIndex(traceData.length - 1);
        }
        hasAutoNavigated.current = true;
      } else if (tracesWereAdded) {
        // Traces were added: maintain position or move to first new trace if user was at the end
        const oldTraceCount = previousTraceCount.current;
        setCurrentTraceIndex(prevIndex => {
          // If user was at or past the old last trace, move to first new trace
          if (prevIndex >= oldTraceCount - 1) {
            return oldTraceCount; // First new trace
          }
          // Otherwise keep their current position
          return prevIndex;
        });
      }
      
      // Update the trace count
      previousTraceCount.current = traceData.length;
    }
  }, [existingFindings, traceData]);

  // Update submitted findings when existing findings change (separate effect to avoid infinite loop)
  useEffect(() => {
    if (existingFindings && traceData.length > 0) {
      const validTraceIds = new Set(traceData.map(t => t.id));
      const completedTraceIds = new Set(existingFindings
        .filter(f => validTraceIds.has(f.trace_id))  // Only count findings for current traces
        .map(f => f.trace_id)
      );
      
      // Only update if the set actually changed
      setSubmittedFindings(prev => {
        const prevArray = Array.from(prev).sort();
        const newArray = Array.from(completedTraceIds).sort();
        if (prevArray.length !== newArray.length || 
            !prevArray.every((id, index) => id === newArray[index])) {
          return completedTraceIds;
        }
        return prev;
      });
    }
  }, [existingFindings, traceData]);

  const nextTrace = async () => {
    if (!currentTrace) return;
    
    // Auto-submit finding if not already submitted and responses are filled
    if (!submittedFindings.has(currentTrace.id) && 
        question1Response.trim() && 
        question2Response.trim()) {
      try {
        await submitFinding.mutateAsync({
          trace_id: currentTrace.id,
          user_id: user?.id || 'demo_user',
          insight: `Quality Assessment: ${question1Response.trim()}\n\nImprovement Analysis: ${question2Response.trim()}`
        });
        setSubmittedFindings(prev => new Set([...prev, currentTrace.id]));
      } catch (error) {
        console.error('Failed to submit finding:', error);
        return; // Don't navigate if submission failed
      }
    }
    
    // Navigate to next trace
    if (currentTraceIndex < traceData.length - 1) {
      setCurrentTraceIndex((prev) => prev + 1);
      // Clear responses for next trace
      setQuestion1Response('');
      setQuestion2Response('');
    }
  };

  const completeDiscovery = async () => {
    if (!user?.id || !workshopId) return;
    
    setIsCompletingDiscovery(true);
    try {
      const response = await fetch(`/workshops/${workshopId}/users/${user.id}/complete-discovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark discovery complete');
      }
      
      toast.success('Discovery phase completed! You can now wait for the facilitator to move to the next phase.');
    } catch (error) {
      console.error('Failed to complete discovery:', error);
      toast.error('Failed to complete discovery. Please try again.');
    } finally {
      setIsCompletingDiscovery(false);
    }
  };

  const handleRefresh = async () => {
    if (workshopId) {
      refetchAllWorkshopQueries(queryClient, workshopId);
    }
  };

  const prevTrace = () => {
    if (currentTraceIndex > 0) {
      setCurrentTraceIndex((prev) => prev - 1);
      // Don't clear responses here - let the useEffect handle populating them
    }
  };

  const handleSubmitFinding = async () => {
    if (!currentTrace || !question1Response.trim() || !question2Response.trim()) return;

    try {
      await submitFinding.mutateAsync({
        trace_id: currentTrace.id,
        user_id: user?.id || 'demo_user',
        insight: `Quality Assessment: ${question1Response.trim()}\n\nImprovement Analysis: ${question2Response.trim()}`
      });
      
      setSubmittedFindings(prev => new Set([...prev, currentTrace.id]));
      setQuestion1Response('');
      setQuestion2Response('');
    } catch (error) {
      console.error('Failed to submit finding:', error);
    }
  };

  // SECURITY: Block access if no valid user (prevent undefined user access)
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </div>
          <div className="text-sm text-gray-500">
            You must be logged in to access discovery traces.
          </div>
        </div>
      </div>
    );
  }

  // Block access to traces until discovery phase starts
  if (currentPhase === 'intake') {
    if (isFacilitator) {
      // Facilitator pre-discovery control panel
      return (
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Begin Discovery</h2>
              <p className="text-slate-600">
                Start the discovery phase to distribute traces to all participants for analysis
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Workshop Status</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div>📊 <strong>Traces ready:</strong> {traceData.length} traces loaded</div>
                <div>👥 <strong>Phase:</strong> Pre-discovery (Intake)</div>
                <div>🎯 <strong>Next step:</strong> Begin discovery phase</div>
              </div>
            </div>
            
            <Button 
              onClick={async () => {
                try {
                  await WorkshopsService.beginDiscoveryPhaseWorkshopsWorkshopIdBeginDiscoveryPost(workshopId!);
                  // Refresh the page to show updated phase
                  window.location.reload();
                } catch (error) {
                  console.error('Failed to start discovery phase:', error);
                  toast.error('Failed to start discovery phase. Please try again.');
                }
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium"
            >
              🚀 Start Discovery Phase
            </Button>
            
            <p className="text-xs text-slate-500 text-center mt-4">
              This will allow all participants to begin exploring traces and providing insights
            </p>
          </div>
        </div>
      );
    } else {
      // Non-facilitator waiting screen
      return (
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <div className="text-lg font-medium text-slate-900 mb-2">
              Discovery Phase Not Started
            </div>
            <div className="text-sm text-slate-600">
              The facilitator will begin the discovery phase shortly
            </div>
          </div>
        </div>
      );
    }
  }

  if (tracesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 mb-2">Loading traces...</div>
          <div className="text-sm text-gray-500">Fetching workshop data from API</div>
        </div>
      </div>
    );
  }

  if (tracesError || !traceData.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            {tracesError ? 'Failed to load traces' : 'No traces available'}
          </div>
          <div className="text-sm text-gray-500">
            {tracesError ? 'Please check your connection and try again' : 'Upload some traces to get started'}
          </div>
        </div>
      </div>
    );
  }

  // Comment out auto-complete screen - let facilitator control phase progression
  // if (isDiscoveryComplete) {
  //   return (
  //     <div className="p-6">
  //       <div className="max-w-4xl mx-auto space-y-6">
  //         <Card className="bg-green-50 border-green-200">
  //           <CardContent className="pt-6">
  //             <div className="text-center">
  //               <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
  //               <h2 className="text-2xl font-bold text-green-800 mb-2">Discovery Phase Complete!</h2>
  //               <p className="text-green-700 mb-4">
  //                 You've successfully reviewed all {traceData.length} traces and submitted findings for each one.
  //               </p>
  //               <div className="bg-white rounded-lg p-4 mb-4">
  //                 <div className="text-sm text-gray-600">
  //                   <strong>Next Step:</strong> Proceed to the Rubric Creation phase where you'll create evaluation criteria based on your findings.
  //                 </div>
  //               </div>
  //               <Badge className="bg-green-500 text-white">
  //                 {submittedFindings.size}/{traceData.length} Findings Submitted
  //               </Badge>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discovery Phase</h2>
          <p className="text-gray-600 mb-4">Review LLM responses and share your insights</p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm text-gray-600">
                {submittedFindings.size} of {traceData.length} complete
                {isDiscoveryComplete && (
                  <span className="ml-2 text-green-600 font-medium">✓ All traces reviewed!</span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDiscoveryComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(submittedFindings.size / traceData.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Current Trace Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                Trace {currentTraceIndex + 1} of {traceData.length}
              </Badge>
              {submittedFindings.has(currentTrace.id) && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Finding Submitted
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Current Trace Display */}
        <TraceViewer trace={currentTrace} />
        
        {/* Trace Data Table View Toggle */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Trace Data Analysis</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTableView(!showTableView)}
                className="flex items-center gap-2"
              >
                <Table className="h-4 w-4" />
                {showTableView ? 'Hide' : 'Show'} Data Table
              </Button>
            </div>
          </CardHeader>
          {showTableView && (
            <CardContent>
              <TraceDataViewer 
                trace={currentTrace}
                showContext={false}
                className="border-0 shadow-none"
              />
            </CardContent>
          )}
        </Card>

        {/* Discovery Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Discovery Questions</CardTitle>
            {!canCreateFindings && (
              <p className="text-sm text-red-600 mt-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                You don't have permission to submit findings. You can view the traces but cannot contribute insights.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="question1" className="text-sm font-medium">
                What makes this response effective or ineffective?
              </Label>
              <Textarea
                id="question1"
                placeholder={canCreateFindings ? "Share your thoughts on what makes this response work well or poorly..." : "You don't have permission to submit findings"}
                value={question1Response}
                onChange={(e) => setQuestion1Response(e.target.value)}
                className="min-h-[100px]"
                disabled={!canCreateFindings}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="question2" className="text-sm font-medium">
                If this response was good, what would have made it bad? If bad, what would have made it good?
              </Label>
              <Textarea
                id="question2"
                placeholder={canCreateFindings ? "Consider alternative scenarios - what changes would flip the quality of this response?" : "You don't have permission to submit findings"}
                value={question2Response}
                onChange={(e) => setQuestion2Response(e.target.value)}
                className="min-h-[100px]"
                disabled={!canCreateFindings}
              />
            </div>

            {/* Status indicator */}
            {submittedFindings.has(currentTrace.id) && (
              <div className="flex justify-end">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Finding Submitted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevTrace}
                disabled={currentTraceIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              
              <Button
                onClick={nextTrace}
                disabled={
                  !canCreateFindings || (
                    !submittedFindings.has(currentTrace.id) && 
                    (!question1Response.trim() || !question2Response.trim())
                  )
                }
                className="flex items-center gap-2"
              >
                {currentTraceIndex === traceData.length - 1 ? (
                  <>
                    <Send className="h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Next
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discovery Completion */}
        {isDiscoveryComplete && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  All Traces Reviewed!
                </h3>
                <p className="text-green-700 mb-4">
                  You've successfully reviewed all {traceData.length} traces and submitted findings for each one.
                </p>
                <Button
                  onClick={completeDiscovery}
                  disabled={isCompletingDiscovery}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCompletingDiscovery ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Completing Discovery...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Discovery Phase
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}