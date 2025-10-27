import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Database, Settings, Download } from 'lucide-react';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { toast } from 'sonner';
import { useWorkflowContext } from '@/context/WorkflowContext';
import { useQueryClient } from '@tanstack/react-query';

interface MLflowConfig {
  databricks_host: string;
  databricks_token: string;
  experiment_id: string;
  max_traces: number;
  filter_string?: string;
}

interface MLflowStatus {
  workshop_id: string;
  is_configured: boolean;
  is_ingested: boolean;
  trace_count: number;
  last_ingestion_time?: string;
  error_message?: string;
  config?: MLflowConfig;
}


export function IntakePage() {
  const { workshopId } = useWorkshopContext();
  const { setCurrentPhase } = useWorkflowContext();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<MLflowConfig>({
    databricks_host: '',
    databricks_token: '',
    experiment_id: '',
    max_traces: 100,
    filter_string: ''
  });
  
  const [status, setStatus] = useState<MLflowStatus | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing configuration and status
  useEffect(() => {
    loadStatus();
  }, [workshopId]);

  const loadStatus = async () => {
    if (!workshopId) {
      console.log('No workshop ID available, skipping MLflow status load');
      return;
    }
    
    try {
      const response = await fetch(`/workshops/${workshopId}/mlflow-status`);
      if (response.ok) {
        const statusData = await response.json();
        setStatus(statusData);
        
        // Load existing config if available
        if (statusData.config) {
          setConfig(statusData.config);
        }
      }
    } catch (err) {
      console.error('Failed to load MLflow status:', err);
    }
  };

  const handleConfigChange = (field: keyof MLflowConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const ingestTraces = async () => {
    if (!workshopId) {
      setError('No workshop available. Please create a workshop first.');
      return;
    }

    if (!config.databricks_host || !config.databricks_token || !config.experiment_id) {
      setError('Please fill in all required fields: Databricks Host, Token, and Experiment ID.');
      return;
    }

    setIsIngesting(true);
    setError(null);

    try {
      console.log('🔄 Starting ingestion process...');
      
      // First, save the configuration (which stores the token in memory)
      console.log('📝 Saving MLflow configuration...');
      const configResponse = await fetch(`/workshops/${workshopId}/mlflow-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!configResponse.ok) {
        const errorData = await configResponse.json();
        setError(errorData.detail || 'Failed to save configuration');
        return;
      }
      console.log('✅ Configuration saved successfully');

      // Then, ingest traces (token will be retrieved from memory)
      console.log('📥 Starting trace ingestion...');
      const response = await fetch(`/workshops/${workshopId}/mlflow-ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // No need to send token - it's retrieved from memory
      });

      console.log('📡 Ingestion response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Ingestion successful:', result);
        await loadStatus();
        
        // Invalidate trace caches to ensure new traces are visible
        queryClient.invalidateQueries({ queryKey: ['traces', workshopId] });
        queryClient.invalidateQueries({ queryKey: ['all-traces', workshopId] });
        
        if (result.trace_count === 0) {
          toast.info('Traces from this experiment have already been ingested. No new traces were added.');
        } else {
          toast.success(`Successfully ingested ${result.trace_count} traces!`);
        }
      } else if (response.status === 404) {
        setError('Workshop or MLflow endpoint not found. Please check your configuration and try again.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Failed to ingest traces (HTTP ${response.status})`);
      }
    } catch (err) {
      console.error('❌ Ingestion error:', err);
      setError('Network error: Unable to connect to the server. Please check your connection and try again.');
    } finally {
      console.log('🔄 Stopping ingestion spinner...');
      setIsIngesting(false);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MLflow Trace Intake</h1>
        <p className="text-gray-600">
          Configure and pull MLflow traces from your Databricks workspace to begin the workshop.
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Intake Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={status.is_configured ? "default" : "secondary"}>
                  {status.is_configured ? "Configured" : "Not Configured"}
                </Badge>
                <Badge variant={status.is_ingested ? "default" : "secondary"}>
                  {status.is_ingested ? "Ingested" : "Not Ingested"}
                </Badge>
                {status.trace_count > 0 && (
                  <Badge variant="outline">
                    {status.trace_count} traces
                  </Badge>
                )}
              </div>
              
              {status.last_ingestion_time && (
                <p className="text-sm text-gray-600">
                  Last ingested: {new Date(status.last_ingestion_time).toLocaleString()}
                </p>
              )}
              
              {status.error_message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.error_message}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading status...</p>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MLflow Configuration
          </CardTitle>
          <CardDescription>
            Configure your Databricks workspace and MLflow experiment details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="databricks_host">Databricks Host</Label>
              <Input
                id="databricks_host"
                placeholder="https://your-workspace.cloud.databricks.com"
                value={config.databricks_host}
                onChange={(e) => handleConfigChange('databricks_host', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="experiment_id">Experiment ID</Label>
              <Input
                id="experiment_id"
                placeholder="1234567890123456"
                value={config.experiment_id}
                onChange={(e) => handleConfigChange('experiment_id', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="databricks_token">Databricks Token</Label>
            <Input
              id="databricks_token"
              type="password"
              placeholder="dapi..."
              value={config.databricks_token}
              onChange={(e) => handleConfigChange('databricks_token', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_traces">Max Traces</Label>
              <Input
                id="max_traces"
                type="number"
                min="1"
                max="1000"
                value={config.max_traces}
                onChange={(e) => handleConfigChange('max_traces', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="filter_string">Filter String (Optional)</Label>
              <Input
                id="filter_string"
                placeholder="attributes.status = 'OK'"
                value={config.filter_string || ''}
                onChange={(e) => handleConfigChange('filter_string', e.target.value)}
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Ingestion Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Ingest Traces
          </CardTitle>
          <CardDescription>
            Pull traces from MLflow into the workshop for analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={ingestTraces}
            disabled={isIngesting || !config.databricks_host || !config.databricks_token || !config.experiment_id}
            className="w-full"
          >
            {isIngesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingesting Traces...
              </>
            ) : (
              'Ingest Traces from MLflow'
            )}
          </Button>
          
          {/* Show ingestion error immediately below the button */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Ready for Discovery Banner */}
      {status?.is_ingested && status.trace_count > 0 && (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">Ready for Discovery Phase</h4>
                <p className="text-sm text-green-700">
                  Traces have been successfully ingested. Use the sidebar workflow to start the discovery phase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
} 