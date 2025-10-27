/**
 * RubricCreationDemo Component
 * 
 * Demonstrates the rubric creation interface for facilitators.
 * After discovery, facilitators create Likert scale questions for annotation.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ClipboardList, 
  Lightbulb, 
  Users, 
  Star,
  ArrowRight,
  Save,
  CheckCircle,
  AlertCircle,
  Edit,
  Grid3x3,
  Focus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { useWorkflowContext } from '@/context/WorkflowContext';
import { useUser, useRoleCheck } from '@/context/UserContext';
import { useRubric, useCreateRubric, useUpdateRubric, useUserFindings, useFacilitatorFindingsWithUserDetails, useAllTraces } from '@/hooks/useWorkshopApi';
import { FocusedAnalysisView, ScratchPadEntry } from '@/components/FocusedAnalysisView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { WorkshopsService } from '@/client';
import type { Rubric, RubricCreate } from '@/client';
import { toast } from 'sonner';

interface RubricQuestion {
  id: string;
  title: string;
  description: string;
}

// Convert API Rubric to local RubricQuestion format
const convertApiRubricToQuestions = (rubric: Rubric): RubricQuestion[] => {
  // Split the rubric question by double newlines to get individual questions
  const questionParts = rubric.question.split('\n\n');
  
  return questionParts.map((questionText, index) => {
    // Parse each question to extract title and description
    const parts = questionText.split(':');
    const title = parts[0]?.trim() || `Question ${index + 1}`;
    const description = parts.slice(1).join(':').trim() || questionText;
    
    return {
      id: `q_${index + 1}`, // Use the same format as the backend
      title,
      description
    };
  });
};

// Convert local RubricQuestion to API format
const convertQuestionToApiRubric = (question: RubricQuestion): RubricCreate => ({
  question: `${question.title}: ${question.description}`,
  created_by: 'facilitator' // In a real app, this would be the actual user
});

// Get discovery responses from real findings data, enriched with trace information
const useDiscoveryResponses = (findings: any[] | undefined, traces: any[] | undefined) => {
  if (!findings || findings.length === 0 || !traces || traces.length === 0) return [];
  
  // Create a map of trace IDs to trace data for quick lookup
  const traceMap = traces.reduce((acc, trace) => {
    acc[trace.id] = trace;
    return acc;
  }, {} as Record<string, any>);
  
  // Group findings by trace_id to organize responses better
  const groupedByTrace = findings.reduce((acc, finding) => {
    if (!acc[finding.trace_id]) {
      acc[finding.trace_id] = [];
    }
    acc[finding.trace_id].push(finding);
    return acc;
  }, {} as Record<string, any[]>);
  
  return Object.entries(groupedByTrace).map(([traceId, traceFindings]) => {
    const trace = traceMap[traceId];
    
    return {
      traceId,
      trace: trace ? {
        input: trace.input,
        output: trace.output,
        context: trace.context,
        mlflow_trace_id: trace.mlflow_trace_id
      } : null,
      responses: traceFindings.map((finding, index) => {
        // Parse the formatted insight string back into separate questions
        const insight = finding.insight || '';
        const parts = insight.split('\n\nImprovement Analysis: ');
        
        let question1 = insight;
        let question2 = null;
        
        if (parts.length === 2) {
          // Remove "Quality Assessment: " prefix if present
          question1 = parts[0].replace('Quality Assessment: ', '');
          question2 = parts[1];
        }
        
        return {
          participant: finding.user_name || finding.user_id,
          question1,
          question2
        };
      })
    };
  }).filter(item => item.trace !== null); // Only return items where we found the corresponding trace
};

// Keep some sample data for demonstration when no real data is available
const sampleDiscoveryResponses = [
  {
    traceId: 'trace_1',
    trace: {
      input: 'Can you help me understand the difference between machine learning and artificial intelligence?',
      output: 'AI is a broader field that encompasses machine learning. Machine learning is a subset of AI that focuses on algorithms that can learn from data without being explicitly programmed. AI includes other techniques like rule-based systems, expert systems, and natural language processing.',
      context: { domain: 'education', complexity: 'beginner' },
      mlflow_trace_id: 'mlflow_trace_123'
    },
    responses: [
      {
        participant: 'SME_1',
        question1: 'The response is clear and technically accurate, but could use more concrete examples. The explanation is good for beginners.',
        question2: 'If this was good, adding jargon without explanation would make it bad. If it was bad, adding specific examples would make it good.'
      },
      {
        participant: 'SME_2', 
        question1: 'Very concise and accurate. Good foundational explanation that builds understanding step by step.',
        question2: 'Bad version would be overly complex or use circular definitions. Good version provides clear distinctions.'
      },
      {
        participant: 'Participant_1',
        question1: 'Easy to understand, not overwhelming. Gives me a clear mental model of the relationship.',
        question2: 'Would be bad if it just listed differences without explaining the relationship. Good because it builds from general to specific.'
      }
    ]
  },
  {
    traceId: 'trace_3',
    trace: {
      input: 'How do I fix a leaky faucet?',
      output: 'Turn off water. Replace the washer.',
      context: { domain: 'home_repair', complexity: 'basic' },
      mlflow_trace_id: 'mlflow_trace_456'
    },
    responses: [
      {
        participant: 'SME_1',
        question1: 'Too brief and lacks important safety information. Missing details about tools needed and troubleshooting steps.',
        question2: 'This is currently bad because it\'s too terse. Would be good if it included safety warnings, tool list, and more detailed steps.'
      },
      {
        participant: 'SME_2',
        question1: 'Very concise but dangerous - no mention of shutting off water first. Could cause flooding.',
        question2: 'Bad because it skips critical safety steps. Good version would prioritize safety and provide troubleshooting guidance.'
      },
      {
        participant: 'Participant_1',
        question1: 'I appreciate the brevity but I\'d be afraid to follow these steps without more context.',
        question2: 'Bad because it assumes knowledge I don\'t have. Good version would explain what might go wrong and how to handle it.'
      }
    ]
  }
];

export function RubricCreationDemo() {
  const { workshopId } = useWorkshopContext();
  const { setCurrentPhase } = useWorkflowContext();
  const { user } = useUser();
  const { isFacilitator } = useRoleCheck();
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<RubricQuestion[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<RubricQuestion, 'id'>>({
    title: '',
    description: ''
  });
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'focused'>('focused');
  const [scratchPad, setScratchPad] = useState<ScratchPadEntry[]>([]);
  const [updatingQuestionId, setUpdatingQuestionId] = useState<string | null>(null);
  const [lastUpdatedQuestionId, setLastUpdatedQuestionId] = useState<string | null>(null);
  
  // Fetch data
  const { data: rubric, isLoading: rubricLoading, error: rubricError } = useRubric(workshopId!);
  // Use all traces for rubric creation page
  const { data: traces } = useAllTraces(workshopId!);
  // Facilitators see all findings to create better rubric, others see their own
  const { data: findings } = isFacilitator 
    ? useFacilitatorFindingsWithUserDetails(workshopId!) 
    : useUserFindings(workshopId!, user);
  const createRubric = useCreateRubric(workshopId!);
  const updateRubric = useUpdateRubric(workshopId!);
  
  // SECURITY: Block access if no valid user
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </div>
          <div className="text-sm text-gray-500">
            You must be logged in to access rubric creation.
          </div>
        </div>
      </div>
    );
  }

  // Get discovery responses from real findings data, enriched with trace information
  const discoveryResponses = useDiscoveryResponses(findings, traces);
  
  // Load scratch pad from localStorage on mount
  useEffect(() => {
    if (workshopId) {
      const storageKey = `scratch-pad-${workshopId}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // Only load if data is less than 24 hours old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🔄 Loading scratch pad from localStorage:', parsed.scratchPad.length, 'items');
            setScratchPad(parsed.scratchPad);
          } else {
            console.log('🗑️ Clearing old scratch pad localStorage data');
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.error('❌ Failed to parse scratch pad localStorage data:', error);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [workshopId]);
  
  // Save scratch pad to localStorage whenever it changes
  useEffect(() => {
    if (workshopId) {
      const storageKey = `scratch-pad-${workshopId}`;
      if (scratchPad.length > 0) {
        const dataToSave = {
          timestamp: Date.now(),
          scratchPad: scratchPad
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        console.log('✅ Saved scratch pad to localStorage:', scratchPad.length, 'items');
      } else {
        // Clear localStorage when scratch pad is empty
        localStorage.removeItem(storageKey);
        console.log('🗑️ Cleared scratch pad from localStorage');
      }
    }
  }, [scratchPad, workshopId]);
  
  // Initialize questions from API data
  useEffect(() => {
    if (rubric && !isEditingExisting) {
      setQuestions(convertApiRubricToQuestions(rubric));
    }
  }, [rubric, isEditingExisting]);

  const addQuestion = async () => {
    if (newQuestion.title.trim() && newQuestion.description.trim()) {
      try {
        // Create the new question
        const newQuestionWithId = {
          ...newQuestion,
          id: Date.now().toString()
        };
        
        // Add the new question to the local questions array
        const updatedQuestions = [...questions, newQuestionWithId];
        setQuestions(updatedQuestions);
        
        // Combine all questions into a single rubric string
        const combinedQuestionText = updatedQuestions.map(q => `${q.title}: ${q.description}`).join('\n\n');
        const apiRubric = {
          question: combinedQuestionText,
          created_by: 'facilitator'
        };
        
        if (rubric) {
          // Update existing rubric with all questions
          await updateRubric.mutateAsync(apiRubric);
        } else {
          // Create new rubric with all questions
          await createRubric.mutateAsync(apiRubric);
        }
        
        // Reset form
        setNewQuestion({
          title: '',
          description: ''
        });
        setIsAddingQuestion(false);
        setIsEditingExisting(false);
        
        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['rubric', workshopId] });
      } catch (error) {
        console.error('Failed to save rubric:', error);
      }
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      // Call the new delete endpoint for individual questions
              await fetch(`/workshops/${workshopId}/rubric/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['rubric', workshopId] });
      
      console.log(`Question "${id}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question. Please try again.');
    }
  };

  const updateQuestion = (id: string, updates: Partial<RubricQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
    setIsEditingExisting(true);
  };

  const updateIndividualQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setUpdatingQuestionId(questionId);
    
    try {
      // Call the new update endpoint for individual questions
      const response = await fetch(`/workshops/${workshopId}/rubric/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: question.title,
          description: question.description
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['rubric', workshopId] });
      
      console.log(`Question "${question.title}" updated successfully`);
      setLastUpdatedQuestionId(questionId);
      
      // Clear success state after 3 seconds
      setTimeout(() => {
        setLastUpdatedQuestionId(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to update question:', error);
      toast.error('Failed to update question. Please try again.');
    } finally {
      setUpdatingQuestionId(null);
    }
  };

  const saveExistingRubric = async () => {
    if (questions.length > 0) {
      try {
        // Combine all questions into a single rubric string
        const combinedQuestionText = questions.map(q => `${q.title}: ${q.description}`).join('\n\n');
        const apiRubric = {
          question: combinedQuestionText,
          created_by: 'facilitator'
        };
        await updateRubric.mutateAsync(apiRubric);
      } catch (error) {
        console.error('Failed to save rubric:', error);
      }
    }
  };


  if (rubricLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 mb-2">Loading rubric...</div>
          <div className="text-sm text-gray-500">Fetching workshop data from API</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className={`h-full ${viewMode === 'grid' ? 'max-w-6xl mx-auto p-6' : 'px-6 py-4'} space-y-6`}>
        {/* Status Badges */}
        <div className="flex justify-center gap-2">
          <Badge variant="outline">
            Facilitator View
          </Badge>
          {rubric && (
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Rubric Exists
            </Badge>
          )}
          {rubricError && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              API Error
            </Badge>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Discovery Responses
            </TabsTrigger>
            <TabsTrigger value="rubric" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Rubric Questions
              {questions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{questions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Discovery Responses Tab */}
          <TabsContent value="discovery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Discovery Responses</span>
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex items-center gap-2"
                    >
                      <Grid3x3 className="h-4 w-4" />
                      Grid View
                    </Button>
                    <Button
                      variant={viewMode === 'focused' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('focused')}
                      className="flex items-center gap-2"
                    >
                      <Focus className="h-4 w-4" />
                      Focused View
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Facilitator Instructions
                  </p>
                  <p className="text-sm text-blue-700">
                    Review participant responses to identify patterns and create rubric questions. Use these responses to facilitate group discussion and build consensus on evaluation criteria.
                  </p>
                </div>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="space-y-8">
                {discoveryResponses.length > 0 ? (
                  discoveryResponses.map((traceResponse, index) => (
                <div key={index} className="border rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Trace Analysis</h3>
                      {traceResponse.trace ? (
                        <p className="text-gray-600 text-sm italic">"{traceResponse.trace.input.substring(0, 100)}..."</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No trace data available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Effectiveness Responses */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Response Effectiveness
                      </h4>
                      <div className="space-y-3">
                        {traceResponse.responses.map((response, responseIndex) => (
                          <div key={responseIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {response.participant.includes('SME') ? 'E' : 'P'}
                                </span>
                              </div>
                              <span className="font-medium text-sm text-gray-700">{response.participant}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{response.question1}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Good/Bad Scenarios */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-green-500" />
                        Good/Bad Scenarios
                      </h4>
                      <div className="space-y-3">
                        {traceResponse.responses.map((response, responseIndex) => (
                          <div key={responseIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {response.participant.includes('SME') ? 'E' : 'P'}
                                </span>
                              </div>
                              <span className="font-medium text-sm text-gray-700">{response.participant}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{response.question2}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Themes (Optional Enhancement) */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-sm text-gray-700">Potential Rubric Themes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Generate themes from actual findings */}
                      {traceResponse.responses.length > 0 && (
                        <>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Empathy & Understanding
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Professional Tone
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Solution Orientation
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Personalization
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Discovery Data Available</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Complete the discovery phase first to see participant insights here.
                    </p>
                    <p className="text-xs text-gray-400">
                      Discovery responses will appear once participants have explored traces and provided feedback.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              discoveryResponses.length > 0 ? (
                <FocusedAnalysisView 
                  discoveryResponses={discoveryResponses}
                  scratchPad={scratchPad}
                  setScratchPad={setScratchPad}
                />
              ) : (
                <div className="text-center py-12">
                  <Focus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Discovery Data for Analysis</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete the discovery phase first to use focused analysis mode.
                  </p>
                  <p className="text-xs text-gray-400">
                    Switch to grid view to create rubric questions manually, or wait for discovery data.
                  </p>
                </div>
              )
            )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rubric Questions Tab */}
          <TabsContent value="rubric">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rubric Questions</span>
                  <Button
                    onClick={() => setIsAddingQuestion(true)}
                className="flex items-center gap-2"
                disabled={isAddingQuestion}
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 && !isAddingQuestion && (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No rubric questions yet</p>
                <Button
                  onClick={() => setIsAddingQuestion(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Question
                </Button>
              </div>
            )}

            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-xl p-6 bg-gradient-to-br from-white to-green-50 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-medium">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${question.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                          Question Title
                        </Label>
                        <Input
                          id={`title-${question.id}`}
                          value={question.title}
                          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                          placeholder="e.g., Response Accuracy"
                          className="font-medium"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label htmlFor={`desc-${question.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                          Question Description
                        </Label>
                        <Textarea
                          id={`desc-${question.id}`}
                          value={question.description}
                          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                          placeholder="e.g., This response is factually accurate and well-supported."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    {/* Scale Preview */}
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-gray-700">Likert Scale Preview</div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          1-5 Scale
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((value) => {
                          const labels = [
                            '', // placeholder for value 0
                            'Strongly Disagree',
                            'Disagree', 
                            'Neutral',
                            'Agree',
                            'Strongly Agree'
                          ];
                          
                          return (
                            <div key={value} className="flex flex-col items-center gap-2">
                              <div className="w-5 h-5 rounded-full border-2 border-green-300 bg-white" />
                              <label className="text-xs text-center text-gray-600 leading-tight">
                                {labels[value]}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateIndividualQuestion(question.id)}
                      className={
                        lastUpdatedQuestionId === question.id 
                          ? "text-green-600 hover:text-green-800 hover:bg-green-50" 
                          : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      }
                      disabled={updatingQuestionId === question.id || updateRubric.isPending}
                      title="Save changes to this question to the database"
                    >
                      {updatingQuestionId === question.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : lastUpdatedQuestionId === question.id ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {updatingQuestionId === question.id ? 'Updating...' : lastUpdatedQuestionId === question.id ? 'Updated!' : 'Update'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      title="Remove this question from the rubric"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Question Form */}
            {isAddingQuestion && (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Add New Rubric Question</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-title" className="text-sm font-medium text-gray-700 mb-1 block">
                        Question Title
                      </Label>
                      <Input
                        id="new-title"
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        placeholder="e.g., Response Helpfulness"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-description" className="text-sm font-medium text-gray-700 mb-1 block">
                        Question Description
                      </Label>
                      <Textarea
                        id="new-description"
                        value={newQuestion.description}
                        onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                        placeholder="e.g., This response is helpful in addressing the user's needs."
                        className="min-h-[80px] bg-white"
                      />
                    </div>
                  </div>
                  
                  {/* Scale Info */}
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Scale (standardized):</div>
                    <div className="grid grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const labels = [
                          '', // placeholder for value 0
                          'Strongly Disagree',
                          'Disagree', 
                          'Neutral',
                          'Agree',
                          'Strongly Agree'
                        ];
                        
                        return (
                          <div key={value} className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-300 bg-white" />
                            <label className="text-xs text-center text-gray-600 leading-tight">
                              {labels[value]}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={addQuestion} 
                      className="flex items-center gap-2"
                      disabled={!newQuestion.title.trim() || !newQuestion.description.trim() || createRubric.isPending || updateRubric.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      {createRubric.isPending || updateRubric.isPending ? 'Saving...' : 'Add Question'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingQuestion(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {questions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Rubric Summary</span>
                </div>
                <p className="text-sm text-green-700">
                  {questions.length} question{questions.length !== 1 ? 's' : ''} created. 
                  Each question will be rated on a 1-5 Likert scale during the annotation phase.
                </p>
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rubric && questions.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Ready for Annotation Phase
                    </p>
                    <p className="text-sm text-green-700">
                      Rubric is complete with {questions.length} question{questions.length !== 1 ? 's' : ''}. Use the sidebar workflow to start the annotation phase.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium mb-1">
                      Rubric Required
                    </p>
                    <p className="text-sm text-amber-700">
                      Create at least one rubric question before proceeding to the annotation phase.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}