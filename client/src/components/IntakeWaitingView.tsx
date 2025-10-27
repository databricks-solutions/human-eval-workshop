import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Clock, CheckCircle } from 'lucide-react';
import { useWorkshopContext } from '@/context/WorkshopContext';

interface MLflowStatus {
  workshop_id: string;
  is_configured: boolean;
  is_ingested: boolean;
  trace_count: number;
  last_ingestion_time?: string;
  error_message?: string;
}

export function IntakeWaitingView() {
  const { workshopId } = useWorkshopContext();
  const [status, setStatus] = useState<MLflowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch(`/workshops/${workshopId}/mlflow-status`);
        if (response.ok) {
          const statusData = await response.json();
          setStatus(statusData);
        } else {
          setError('Failed to load intake status');
        }
      } catch (err) {
        setError('Failed to load intake status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [workshopId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading intake status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting for Traces</h1>
        <p className="text-gray-600">
          The facilitator is setting up MLflow trace intake. You'll be able to view traces once they're loaded.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Intake Progress
          </CardTitle>
          <CardDescription>
            Current status of trace ingestion from MLflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              {/* Configuration Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Configuration</span>
                <Badge variant={status.is_configured ? "default" : "secondary"}>
                  {status.is_configured ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configured
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>

              {/* Ingestion Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trace Ingestion</span>
                <Badge variant={status.is_ingested ? "default" : "secondary"}>
                  {status.is_ingested ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>

              {/* Trace Count */}
              {status.trace_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Traces Available</span>
                  <Badge variant="outline">
                    {status.trace_count} traces
                  </Badge>
                </div>
              )}

              {/* Last Ingestion Time */}
              {status.last_ingestion_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-gray-600">
                    {new Date(status.last_ingestion_time).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Error Message */}
              {status.error_message && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Error:</strong> {status.error_message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Message */}
              {!status.is_configured && (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">
                    Waiting for facilitator to configure MLflow connection...
                  </p>
                </div>
              )}

              {status.is_configured && !status.is_ingested && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-gray-600">
                    MLflow is configured. Waiting for traces to be ingested...
                  </p>
                </div>
              )}

              {status.is_ingested && status.trace_count > 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-green-600 font-medium">
                    Traces are ready! The facilitator will advance to the next phase soon.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                {error || 'Unable to load intake status'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 