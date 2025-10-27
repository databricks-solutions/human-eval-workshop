import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useWorkflowContext } from '@/context/WorkflowContext';

interface PhasePausedViewProps {
  phase: 'discovery' | 'annotation';
  onBack?: () => void;
}

export const PhasePausedView: React.FC<PhasePausedViewProps> = ({ phase, onBack }) => {
  const { currentPhase } = useWorkflowContext();
  
  const phaseConfig = {
    discovery: {
      title: 'Discovery Phase Paused',
      description: 'The discovery phase has been temporarily paused by the facilitator.',
      icon: <Pause className="w-8 h-8 text-blue-600" />,
      color: 'blue',
      nextPhase: 'The facilitator will resume discovery or advance to the rubric creation phase.'
    },
    annotation: {
      title: 'Annotation Phase Paused',
      description: 'The annotation phase has been temporarily paused by the facilitator.',
      icon: <Pause className="w-8 h-8 text-purple-600" />,
      color: 'purple',
      nextPhase: 'The facilitator will resume annotation or advance to the results phase.'
    }
  };
  
  const config = phaseConfig[phase];
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      text: 'text-blue-900',
      subtext: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700'
    },
    purple: {
      bg: 'from-purple-50 to-indigo-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      text: 'text-purple-900',
      subtext: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700'
    }
  };
  
  const colors = colorClasses[config.color];
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <Card className={`${colors.border} bg-gradient-to-br ${colors.bg}`}>
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {config.icon}
            </div>
            <CardTitle className={`text-2xl ${colors.text}`}>
              {config.title}
            </CardTitle>
            <CardDescription className={`text-base ${colors.subtext} mt-2`}>
              {config.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Information */}
            <div className="bg-white/70 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Your Contributions Saved</p>
                  <p className="text-sm text-slate-600">
                    All your {phase === 'discovery' ? 'findings' : 'annotations'} have been saved successfully.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Waiting for Facilitator</p>
                  <p className="text-sm text-slate-600">
                    {config.nextPhase}
                  </p>
                </div>
              </div>
            </div>
            
            {/* What to Do Now */}
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">What You Can Do Now</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>Take a break and wait for the facilitator to resume</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>Stay on this page to be notified when the phase resumes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>The page will automatically update when the phase status changes</span>
                </li>
              </ul>
            </div>
            
            {/* Action Button */}
            {onBack && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>This page will refresh automatically when the phase status changes.</p>
          <p className="mt-1">No action is required from you at this time.</p>
        </div>
      </div>
    </div>
  );
};