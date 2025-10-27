import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Users, ClipboardList, Eye } from 'lucide-react';

export const AnnotationPendingPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Annotation Phase Pending</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Waiting for the facilitator to start the annotation phase. SMEs will begin rating traces once it begins.
        </p>
        <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
          <Clock className="w-3 h-3 mr-1" />
          Waiting for Facilitator
        </Badge>
      </div>

      {/* What Happens During Annotation */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            What Happens During Annotation
          </CardTitle>
          <CardDescription>
            Understanding the annotation process and your role as an observer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">SMEs Lead the Rating Process</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Subject Matter Experts will systematically rate traces using the evaluation rubric created from discovery insights.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Structured Evaluation</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Each trace is rated on a 1-5 scale with detailed comments, creating consistent evaluation data for analysis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">You Observe & Learn</h4>
                <p className="text-sm text-slate-600 mt-1">
                  As a participant, you'll observe the annotation process, gaining insights into systematic LLM evaluation methods.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites Check */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-600" />
            Prerequisites for Annotation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-900">Discovery Phase Completed</p>
                <p className="text-sm text-slate-600">All participants have contributed insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-900">Evaluation Rubric Created</p>
                <p className="text-sm text-slate-600">Facilitator has built rubric from discovery findings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-700">Current Workshop Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-slate-900">Preparing for Annotation</p>
                <p className="text-sm text-slate-600">The facilitator will start annotation when ready</p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              Pre-Annotation
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Your Role */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-700">Your Role During This Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Observe the Process:</strong> Watch how SMEs apply the rubric to evaluate traces systematically</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Learn Evaluation Methods:</strong> Understand how the rubric translates discovery insights into measurable criteria</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Prepare for Results:</strong> The annotations will generate Inter-Rater Reliability (IRR) data for analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500">
        <p>This page will automatically update when the annotation phase begins. Your observations will be valuable for understanding the evaluation process!</p>
      </div>
    </div>
  );
};