import React from 'react';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { useWorkflowContext } from '@/context/WorkflowContext';
import { useUser, useRoleCheck } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFacilitatorFindings, useFacilitatorFindingsWithUserDetails, useTraces, useAllTraces, useRubric, useFacilitatorAnnotations, useWorkshop } from '@/hooks/useWorkshopApi';
import { Settings, Users, FileText, CheckCircle, Clock, AlertCircle, BarChart, ChevronRight, Play, Eye, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { PhaseControlButton } from './PhaseControlButton';
import { toast } from 'sonner';

interface FacilitatorDashboardProps {
  onNavigate: (phase: string) => void;
  focusPhase?: 'discovery' | 'annotation' | null; // Highlight specific phase when accessed from workflow
}

export const FacilitatorDashboard: React.FC<FacilitatorDashboardProps> = ({ onNavigate, focusPhase = null }) => {
  const { workshopId } = useWorkshopContext();
  const { currentPhase, setCurrentPhase } = useWorkflowContext();
  const { user } = useUser();
  const { isFacilitator } = useRoleCheck();
  const queryClient = useQueryClient();

  // Get all workshop data
  const { data: workshop } = useWorkshop(workshopId!);
  const { data: allFindings } = useFacilitatorFindings(workshopId!);
  const { data: allFindingsWithUserDetails } = useFacilitatorFindingsWithUserDetails(workshopId!);
  // Facilitators viewing all traces - don't need personalized ordering
  const { data: traces } = useAllTraces(workshopId!);
  const { data: rubric } = useRubric(workshopId!);
  const { data: annotations } = useFacilitatorAnnotations(workshopId!);

  // Redirect non-facilitators
  if (!isFacilitator) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-900 mb-2">
            Facilitator Access Required
          </div>
          <div className="text-sm text-slate-600">
            This dashboard is only available to workshop facilitators
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress metrics
  // For discovery: use active discovery traces count or all traces
  const discoveryTraceCount = ((workshop?.current_phase === 'discovery' || focusPhase === 'discovery') && workshop?.active_discovery_trace_ids?.length) 
    ? workshop.active_discovery_trace_ids.length 
    : (traces?.length || 0);
  
  // For annotation: use active annotation traces count or all traces  
  const annotationTraceCount = (workshop?.current_phase === 'annotation' && workshop?.active_annotation_trace_ids?.length)
    ? workshop.active_annotation_trace_ids.length
    : (traces?.length || 0);
    
  const totalTraces = traces?.length || 0; // Keep for general use
  const tracesWithFindings = allFindings ? new Set(allFindings.map(f => f.trace_id)) : new Set();
  const completedDiscoveryTraces = Math.min(tracesWithFindings.size, discoveryTraceCount);
  const discoveryProgress = discoveryTraceCount > 0 ? (completedDiscoveryTraces / discoveryTraceCount) * 100 : 0;

  // Get user participation stats with user names
  const activeUsers = allFindings ? new Set(allFindings.map(f => f.user_id)) : new Set();
  
  // For annotation phase, use annotation-based active users
  const activeAnnotators = annotations ? new Set(annotations.map(a => a.user_id)) : new Set();
  
  const userContributions = allFindingsWithUserDetails ? 
    Object.entries(
      allFindingsWithUserDetails.reduce((acc, finding) => {
        const userId = finding.user_id;
        if (!acc[userId]) {
          acc[userId] = { count: 0, userName: finding.user_name || userId };
        }
        acc[userId].count += 1;
        return acc;
      }, {} as Record<string, { count: number; userName: string }>)
    ).map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
    : [];

  // Calculate trace coverage details
  const traceCoverageDetails = React.useMemo(() => {
    if (!traces || !allFindings) return [];
    
    // Debug logging
    console.log('🔍 Facilitator Dashboard - Trace Coverage Calculation:', {
      focusPhase,
      tracesCount: traces.length,
      allFindingsCount: allFindings?.length,
      annotationsCount: annotations?.length,
      activeUsers: activeUsers.size,
      activeAnnotators: activeAnnotators.size,
      sampleAnnotation: annotations?.[0],
      sampleAnnotationTraceId: annotations?.[0]?.trace_id,
      sampleTrace: traces?.[0],
      sampleTraceId: traces?.[0]?.id,
      annotationTraceIds: annotations?.map(a => a.trace_id),
      traceIds: traces?.slice(0, 5).map(t => t.id)
    });
    
    // Filter traces based on focusPhase
    let relevantTraces = traces;
    if (focusPhase === 'discovery' && workshop?.active_discovery_trace_ids?.length) {
      relevantTraces = traces.filter(trace => workshop.active_discovery_trace_ids.includes(trace.id));
      console.log(`🔍 Filtered to ${relevantTraces.length} discovery traces from ${workshop.active_discovery_trace_ids.length} active IDs`);
    } else if (focusPhase === 'annotation') {
      // For annotation phase: show all traces that have annotations OR are in active_annotation_trace_ids
      if (annotations && annotations.length > 0) {
        const annotatedTraceIds = new Set(annotations.map(a => a.trace_id));
        const activeTraceIds = new Set(workshop?.active_annotation_trace_ids || []);
        const allRelevantIds = new Set([...annotatedTraceIds, ...activeTraceIds]);
        
        relevantTraces = traces.filter(trace => allRelevantIds.has(trace.id));
        console.log(`🔍 Filtered to ${relevantTraces.length} annotation traces (${annotatedTraceIds.size} with annotations + ${activeTraceIds.size} active)`);
        console.log(`🔍 Annotated trace IDs:`, Array.from(annotatedTraceIds));
        console.log(`🔍 Active annotation trace IDs:`, Array.from(activeTraceIds));
      } else if (workshop?.active_annotation_trace_ids?.length) {
        // Fallback: use active_annotation_trace_ids if no annotations yet
        relevantTraces = traces.filter(trace => workshop.active_annotation_trace_ids.includes(trace.id));
        console.log(`🔍 Filtered to ${relevantTraces.length} annotation traces from ${workshop.active_annotation_trace_ids.length} active IDs`);
      }
    }
    
    return relevantTraces.map(trace => {
      // Use different data source based on focus phase
      if (focusPhase === 'annotation' && annotations) {
        const annotationsForTrace = annotations.filter(a => a.trace_id === trace.id);
        const reviewerIds = new Set(annotationsForTrace.map(a => a.user_id));
        
        console.log(`📊 Trace ${trace.id.slice(0, 8)}: ${annotationsForTrace.length} annotations from ${reviewerIds.size} reviewers`);
        
        // Use activeAnnotators instead of activeUsers for annotation phase
        const minReviewers = Math.min(2, activeAnnotators.size); // At least 2 reviewers for IRR
        
        return {
          traceId: trace.mlflow_trace_id || trace.id,
          input: trace.input,
          reviewCount: annotationsForTrace.length,
          uniqueReviewers: reviewerIds.size,
          reviewers: Array.from(reviewerIds),
          isFullyReviewed: activeAnnotators.size > 0 && reviewerIds.size >= minReviewers
        };
      } else {
        // Default to discovery findings
        const findingsForTrace = allFindings.filter(f => f.trace_id === trace.id);
        const reviewerIds = new Set(findingsForTrace.map(f => f.user_id));
        
        return {
          traceId: trace.mlflow_trace_id || trace.id,
          input: trace.input,
          reviewCount: findingsForTrace.length,
          uniqueReviewers: reviewerIds.size,
          reviewers: Array.from(reviewerIds),
          isFullyReviewed: activeUsers.size > 0 && reviewerIds.size >= Math.min(3, activeUsers.size) // Consider "full" only if there are active users and sufficient reviews
        };
      }
    })
    // Sort: completed first, then in progress, then pending (by review count)
    .sort((a, b) => {
      // Completed traces first
      if (a.isFullyReviewed && !b.isFullyReviewed) return -1;
      if (!a.isFullyReviewed && b.isFullyReviewed) return 1;
      // Then sort by review count (most reviews first)
      return b.reviewCount - a.reviewCount;
    });
  }, [traces, allFindings, annotations, activeUsers.size, activeAnnotators.size, focusPhase, workshop?.active_discovery_trace_ids, workshop?.active_annotation_trace_ids]);

  // Annotation progress
  const tracesWithAnnotations = annotations ? new Set(annotations.map(a => a.trace_id)) : new Set();
  const annotationProgress = annotationTraceCount > 0 ? (tracesWithAnnotations.size / annotationTraceCount) * 100 : 0;

  // Annotation metrics for focused view
  const annotationMetrics = React.useMemo(() => {
    if (!annotations) return { smeCount: 0, participantCount: 0, avgRating: 0, ratingDistribution: {} };
    
    // Separate SME and participant annotations (role data stored with each annotation)
    const smeAnnotations = annotations.filter(a => a.user_id.includes('sme') || a.user_id.includes('SME'));
    const participantAnnotations = annotations.filter(a => !a.user_id.includes('sme') && !a.user_id.includes('SME'));
    
    // Calculate average rating
    const avgRating = annotations.length > 0 ? 
      annotations.reduce((sum, a) => sum + a.rating, 0) / annotations.length : 0;
    
    // Rating distribution
    const ratingDistribution = annotations.reduce((dist, a) => {
      dist[a.rating] = (dist[a.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);
    
    return {
      smeCount: smeAnnotations.length,
      participantCount: participantAnnotations.length,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingDistribution
    };
  }, [annotations]);

  // Phase advancement logic
  const getNextPhase = () => {
    const phaseOrder = ['intake', 'discovery', 'rubric', 'annotation', 'results'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
  };

  const getPhaseAdvancementText = () => {
    const nextPhase = getNextPhase();
    if (!nextPhase) return null;
    
    const phaseNames = {
      'discovery': 'Discovery',
      'rubric': 'Rubric Creation', 
      'annotation': 'Annotation',
      'results': 'Results Review'
    };
    
    return `Start ${phaseNames[nextPhase as keyof typeof phaseNames] || nextPhase}`;
  };

  const canAdvancePhase = () => {
    return getNextPhase() !== null;
  };

  const handleAdvancePhase = async () => {
    const nextPhase = getNextPhase();
    if (!nextPhase) return;
    
    const confirmMessage = `Ready to start the ${nextPhase} phase?\n\nThis will move the workshop forward for all participants. Current progress:\n• Discovery: ${Math.round(discoveryProgress)}% complete\n• Active users: ${activeUsers.size}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      // Use specific validated endpoint
      const endpoint = `/workshops/${workshopId}/advance-to-${nextPhase}`;
      const response = await fetch(endpoint, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to advance phase');
      }
      
      const result = await response.json();
      console.log('Phase advancement result:', result);
      
      // Update local state
      setCurrentPhase(nextPhase);
      
      // Clear React Query cache to refresh all data
      queryClient.invalidateQueries();
      
    } catch (error) {
      console.error('Failed to advance phase:', error);
      toast.error(`Failed to start ${nextPhase} phase: ${error.message}`);
    }
  };

  // Additional traces functionality - separate state for each phase
  const [discoveryTracesCount, setDiscoveryTracesCount] = React.useState<string>('');
  const [annotationTracesCount, setAnnotationTracesCount] = React.useState<string>('');
  const [isAddingTraces, setIsAddingTraces] = React.useState(false);
  const [isReorderingTraces, setIsReorderingTraces] = React.useState(false);

  const handleAddAdditionalTraces = async () => {
    const phase = focusPhase || currentPhase;
    const phaseLabel = phase === 'annotation' ? 'annotation' : 'discovery';
    
    // Use appropriate count state based on phase
    const countValue = phase === 'annotation' ? annotationTracesCount : discoveryTracesCount;
    const setCountValue = phase === 'annotation' ? setAnnotationTracesCount : setDiscoveryTracesCount;
    
    const count = parseInt(countValue);
    if (!count || count <= 0) {
      toast.error('Please enter a valid number of traces to add.');
      return;
    }
    
    setIsAddingTraces(true);
    try {
      // Use unified endpoint with explicit phase parameter
      const response = await fetch(`/workshops/${workshopId}/add-traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          additional_count: count,
          phase: phase === 'annotation' ? 'annotation' : 'discovery'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add traces');
      }

      const result = await response.json();
      console.log('Additional traces added:', result);
      console.log('Current workshop active_discovery_trace_ids before invalidation:', workshop?.active_discovery_trace_ids?.length);
      
      // Clear the appropriate input and refresh data
      setCountValue('');
      
      // Force refetch of workshop data with more aggressive invalidation
      await queryClient.refetchQueries({ queryKey: ['workshop', workshopId] });
      await queryClient.refetchQueries({ queryKey: ['traces', workshopId] });
      queryClient.invalidateQueries({ queryKey: ['findings', workshopId] });
      queryClient.invalidateQueries({ queryKey: ['annotations', workshopId] });
      
      // Log after refetch
      setTimeout(() => {
        console.log('Workshop active_discovery_trace_ids after refetch should be updated');
      }, 100);
      
      toast.success(`Successfully added ${result.traces_added} traces to ${phaseLabel}! (Total: ${result.total_active_traces})`);
    } catch (error) {
      console.error('Failed to add additional traces:', error);
      toast.error(`Failed to add traces: ${error.message}`);
    } finally {
      setIsAddingTraces(false);
    }
  };

  const handleReorderAnnotationTraces = async () => {
    setIsReorderingTraces(true);
    try {
      const response = await fetch(`/workshops/${workshopId}/reorder-annotation-traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to reorder traces');
      }

      const result = await response.json();
      console.log('Traces reordered:', result);
      
      // Refresh data
      await queryClient.refetchQueries({ queryKey: ['workshop', workshopId] });
      await queryClient.refetchQueries({ queryKey: ['traces', workshopId] });
      queryClient.invalidateQueries({ queryKey: ['annotations', workshopId] });
      
      toast.success(`Successfully reordered ${result.reordered_count} traces! Completed traces now appear first.`);
    } catch (error) {
      console.error('Failed to reorder traces:', error);
      toast.error(`Failed to reorder traces: ${error.message}`);
    } finally {
      setIsReorderingTraces(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {focusPhase === 'discovery' ? 'Discovery Phase Monitoring' : 
                 focusPhase === 'annotation' ? 'Annotation Phase Monitoring' : 
                 'Facilitator Dashboard'}
              </h1>
              <p className="text-slate-600">
                {focusPhase === 'discovery' ? 'Monitor participant discovery progress and insights' :
                 focusPhase === 'annotation' ? 'Monitor SME annotation progress and ratings' :
                 'Workshop progress tracking and management'}
              </p>
            </div>
          </div>
          
          {/* Phase Control - Only show advance button, remove floating pause */}
          <div className="flex items-center gap-3">
            {/* Advance Phase Button - hide when viewing focused phase dashboards */}
            {canAdvancePhase() && !focusPhase && (
              <Button
                onClick={handleAdvancePhase}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                {getPhaseAdvancementText()}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Overall Progress Cards */}
        <div className={`grid grid-cols-1 gap-6 ${
          focusPhase === 'discovery' ? 'md:grid-cols-1 max-w-md mx-auto' : 
          focusPhase === 'annotation' ? 'md:grid-cols-1 max-w-md mx-auto' : 
          'md:grid-cols-3'
        }`}>
          {/* Discovery Progress - Hide during annotation focus, always show otherwise */}
          {focusPhase !== 'annotation' && (
          <Card className={`bg-gradient-to-br from-green-50 to-green-50 border-green-200 ${
            focusPhase === 'discovery' ? 'ring-2 ring-green-400 shadow-lg' : ''
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <FileText className="w-5 h-5" />
                Discovery Phase
                {(() => {
                  if (discoveryProgress === 100) {
                    return <Badge className="ml-2 bg-emerald-100 text-emerald-700">Completed</Badge>;
                  } else if (focusPhase === 'discovery') {
                    return <Badge className="ml-2 bg-slate-100 text-slate-600">Viewing</Badge>;
                  }
                  return null;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Traces Analyzed</span>
                  <span className="text-sm font-medium text-green-800">
                    {completedDiscoveryTraces}/{discoveryTraceCount}
                  </span>
                </div>
                <Progress value={discoveryProgress} className="h-2" />
                <div className="flex justify-between items-center text-xs text-green-600">
                  <span>{Math.round(discoveryProgress)}% Complete</span>
                  <span>{activeUsers.size} Active Users</span>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Ready for Rubric Creation Banner - Show when discovery is complete */}
          {discoveryProgress === 100 && !rubric && focusPhase === 'discovery' && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">Ready for Rubric Creation</h4>
                    <p className="text-sm text-green-700">
                      Discovery phase complete! Use the sidebar workflow to create the evaluation rubric.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rubric Status - Hide during discovery AND annotation focus */}
          {focusPhase !== 'discovery' && focusPhase !== 'annotation' && (
            <Card className={`bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200 ${
              focusPhase === 'annotation' ? 'ring-2 ring-blue-400 shadow-lg' : ''
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Settings className="w-5 h-5" />
                  Rubric Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rubric ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-blue-700">Rubric Created</span>
                      </div>
                      <p className="text-xs text-blue-600 line-clamp-2">
                        {rubric[0]?.question || 'Evaluation rubric is ready'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate('rubric')}
                        className="w-full text-xs"
                      >
                        View Rubric
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-blue-700">Rubric Needed</span>
                      </div>
                      <p className="text-xs text-blue-600">
                        Create evaluation criteria for annotation phase
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate('rubric')}
                        className="w-full text-xs"
                      >
                        Create Rubric
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annotation Progress - Hide during discovery focus, show during annotation focus or general view */}
          {focusPhase !== 'discovery' && (
            <Card className={`bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200 ${
              focusPhase === 'annotation' ? 'ring-2 ring-purple-400 shadow-lg' : ''
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Users className="w-5 h-5" />
                  Annotation Phase
                  {(() => {
                    if (annotationProgress === 100) {
                      return <Badge className="ml-2 bg-emerald-100 text-emerald-700">Completed</Badge>;
                    } else if (focusPhase === 'annotation') {
                      return <Badge className="ml-2 bg-slate-100 text-slate-600">Viewing</Badge>;
                    }
                    return null;
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(currentPhase === 'annotation' || focusPhase === 'annotation') ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">Traces Annotated</span>
                        <span className="text-sm font-medium text-purple-800">
                          {tracesWithAnnotations.size}/{annotationTraceCount}
                        </span>
                      </div>
                      <Progress value={annotationProgress} className="h-2" />
                      
                      {focusPhase === 'annotation' ? (
                        // Detailed annotation metrics when focused
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-purple-600">
                            <span>Average Rating:</span>
                            <span className="font-medium">{annotationMetrics.avgRating}/5</span>
                          </div>
                          <div className="flex justify-between text-purple-600">
                            <span>SME Annotations:</span>
                            <span className="font-medium">{annotationMetrics.smeCount}</span>
                          </div>
                          <div className="flex justify-between text-purple-600">
                            <span>Participant Annotations:</span>
                            <span className="font-medium">{annotationMetrics.participantCount}</span>
                          </div>
                          {Object.keys(annotationMetrics.ratingDistribution).length > 0 && (
                            <div className="pt-1 border-t border-purple-200">
                              <div className="text-purple-700 font-medium mb-1">Rating Distribution:</div>
                              {[5, 4, 3, 2, 1].map(rating => (
                                annotationMetrics.ratingDistribution[rating] && (
                                  <div key={rating} className="flex justify-between">
                                    <span>{rating}⭐:</span>
                                    <span>{annotationMetrics.ratingDistribution[rating]}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Simple progress when not focused
                        <div className="text-xs text-purple-600">
                          {Math.round(annotationProgress)}% Complete
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-700">
                          {currentPhase === 'discovery' ? 'Pending Discovery' : 'Not Started'}
                        </span>
                      </div>
                      <p className="text-xs text-purple-600">
                        SMEs will annotate traces using the rubric
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ready for Review/Tuning Banner - Show when annotation is complete */}
        {annotationProgress === 100 && currentPhase === 'annotation' && focusPhase === 'annotation' && (
          <div className="mb-6">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">Ready for Results Review & Judge Tuning</h4>
                    <p className="text-sm text-green-700">
                      Annotation phase complete! Use the sidebar workflow to review IRR results and proceed to judge tuning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {focusPhase === 'discovery' ? 'Discovery Analysis' : 'Workshop Analysis'}
            </CardTitle>
            <CardDescription>
              {focusPhase === 'discovery' ? 
                'Detailed breakdown of discovery progress and trace coverage' :
                'User participation and trace coverage analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">User Participation</TabsTrigger>
                <TabsTrigger value="traces">Trace Coverage</TabsTrigger>
              </TabsList>

              {/* User Participation Tab */}
              <TabsContent value="users">
                {userContributions.length > 0 ? (
                  <div className="space-y-3">
                                    {userContributions.map(({ userId, userName, count }) => {
                  const userTraces = traceCoverageDetails.filter(t => t.reviewers.includes(userId)).length;
                  return (
                    <div key={userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {userName}
                          </div>
                          <div className="text-xs text-slate-600">
                            {count} finding{count !== 1 ? 's' : ''} • {userTraces} trace{userTraces !== 1 ? 's' : ''} reviewed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={count >= 3 ? 'default' : 'secondary'} className="text-xs">
                          {count >= 3 ? 'Active' : 'Participating'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No user participation data yet</p>
                    <p className="text-xs">Users will appear here once they start contributing findings</p>
                  </div>
                )}
              </TabsContent>

              {/* Trace Coverage Tab */}
              <TabsContent value="traces">
                {traceCoverageDetails.length > 0 ? (
                  <div className="space-y-3" data-testid="trace-coverage">
                    {traceCoverageDetails.map((trace) => (
                      <div key={trace.traceId} className="border rounded-lg p-4 bg-slate-50" data-testid="trace-item">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-slate-900 text-sm">
                                Trace: {trace.traceId.slice(0, 20)}...
                              </h4>
                              <Badge 
                                variant={trace.isFullyReviewed ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {trace.reviewCount} review{trace.reviewCount !== 1 ? 's' : ''}
                              </Badge>
                              <Badge 
                                variant={trace.uniqueReviewers >= 2 ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {trace.uniqueReviewers} reviewer{trace.uniqueReviewers !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                              {trace.input.slice(0, 120)}...
                            </p>
                            {trace.reviewers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {trace.reviewers.map(reviewer => {
                                  // Find the user name from the findings with user details
                                  const userFinding = allFindingsWithUserDetails?.find(f => f.user_id === reviewer);
                                  const reviewerName = userFinding?.user_name || reviewer;
                                  return (
                                    <Badge key={reviewer} variant="outline" className="text-xs px-2 py-0">
                                      {reviewerName}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-right text-xs">
                              <div className={`font-medium status-text ${
                                trace.isFullyReviewed ? 'text-green-600' : 
                                trace.reviewCount > 0 ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {trace.isFullyReviewed ? '✓ Complete' : 
                                 trace.reviewCount > 0 ? 'In Progress' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No trace coverage data yet</p>
                    <p className="text-xs">Traces will appear here once they start being reviewed</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {focusPhase === 'discovery' ? 'Discovery phase management tools' :
               focusPhase === 'annotation' ? 'Annotation phase management tools' :
               'Common facilitator tasks and workshop management'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-1 gap-4 ${
              focusPhase === 'discovery' ? 'md:grid-cols-2 lg:grid-cols-3' : 
              focusPhase === 'annotation' ? 'md:grid-cols-2 lg:grid-cols-3' : 
              'md:grid-cols-3'
            }`}>
              {/* View All Findings - Hide during discovery and annotation focus */}
              {focusPhase !== 'discovery' && focusPhase !== 'annotation' && (
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-start p-4 h-auto"
                onClick={() => onNavigate('view-all-findings')}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">View All Findings</div>
                  <div className="text-xs text-muted-foreground">Review participant insights</div>
                </div>
              </Button>
              )}

              {/* Discovery-specific actions */}
              {focusPhase === 'discovery' && (
                <>
                  {/* Add Additional Traces */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Add More Traces</div>
                        <div className="text-xs text-muted-foreground">Include additional traces in discovery</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Number of traces"
                        value={discoveryTracesCount}
                        onChange={(e) => setDiscoveryTracesCount(e.target.value)}
                        className="flex-1 h-8 text-xs"
                        disabled={isAddingTraces}
                      />
                      <Button
                        onClick={handleAddAdditionalTraces}
                        disabled={isAddingTraces || !discoveryTracesCount}
                        size="sm"
                        className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isAddingTraces ? (
                          <>
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Phase Control Button */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Discovery Control</div>
                        <div className="text-xs text-muted-foreground">Pause or resume discovery phase</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <PhaseControlButton phase="discovery" />
                    </div>
                  </div>
                </>
              )}

              {/* Annotation-specific actions */}
              {focusPhase === 'annotation' && (
                <>
                  {/* Add Additional Traces for Annotation */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Add More Traces</div>
                        <div className="text-xs text-muted-foreground">Include additional traces for annotation</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Number of traces"
                        value={annotationTracesCount}
                        onChange={(e) => setAnnotationTracesCount(e.target.value)}
                        className="flex-1 h-8 text-xs"
                        disabled={isAddingTraces}
                      />
                      <Button
                        onClick={handleAddAdditionalTraces}
                        disabled={isAddingTraces || !annotationTracesCount}
                        size="sm"
                        className="h-8 px-3"
                      >
                        {isAddingTraces ? (
                          <>
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Phase Control Button */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Annotation Control</div>
                        <div className="text-xs text-muted-foreground">Pause or resume annotation phase</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <PhaseControlButton phase="annotation" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};