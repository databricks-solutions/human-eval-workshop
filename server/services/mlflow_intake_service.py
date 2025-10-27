"""MLflow intake service for pulling traces from MLflow experiments."""

from typing import Any, Dict, List

import mlflow
import mlflow.genai

from server.models import MLflowIntakeConfig, MLflowTraceInfo, TraceUpload
from server.services.database_service import DatabaseService


class MLflowIntakeService:
  """Service for MLflow trace intake operations."""

  def __init__(self, db_service: DatabaseService):
    self.db_service = db_service

  def configure_mlflow(self, config: MLflowIntakeConfig) -> None:
    """Configure MLflow with Databricks credentials."""
    try:
      # Validate configuration
      if not config.databricks_host or not config.databricks_token:
        raise ValueError('Databricks host and token are required')

      # Validate host format
      if not config.databricks_host.startswith('https://'):
        raise ValueError('Databricks host must start with https://')

      # Set tracking URI to Databricks
      mlflow.set_tracking_uri('databricks')

      # Set authentication
      import os

      os.environ['DATABRICKS_HOST'] = config.databricks_host.rstrip('/')
      os.environ['DATABRICKS_TOKEN'] = config.databricks_token

    except Exception as e:
      raise ValueError(f'Failed to configure MLflow: {str(e)}')

  def search_traces(self, config: MLflowIntakeConfig) -> List[MLflowTraceInfo]:
    """Search for traces in MLflow experiment with proper error handling."""
    try:
      # Configure MLflow
      self.configure_mlflow(config)

      # Search for traces with error handling
      traces = mlflow.search_traces(
        experiment_ids=[config.experiment_id],
        max_results=config.max_traces or 100,
        filter_string=config.filter_string,
        return_type='list',
      )

      trace_info_list = []
      for trace in traces:
        try:
          if hasattr(trace, 'info') and hasattr(trace.info, 'request_id'):
            # Extract content from JSON for previews
            input_content = self._extract_content_from_json(trace.data.request)
            output_content = self._extract_content_from_json(trace.data.response)

            trace_info = MLflowTraceInfo(
              trace_id=trace.info.request_id,
              request_preview=self._truncate_text(input_content, 200),
              response_preview=self._truncate_text(output_content, 200),
              execution_time_ms=getattr(trace.info, 'execution_time_ms', None),
              status=getattr(trace.info, 'status', 'UNKNOWN'),
              timestamp_ms=getattr(trace.info, 'timestamp_ms', 0),
              tags=dict(trace.info.tags) if hasattr(trace.info, 'tags') and trace.info.tags else None,
              mlflow_url=self._generate_mlflow_url(config.databricks_host, config.experiment_id, trace.info.request_id),
            )
            trace_info_list.append(trace_info)
        except Exception as trace_error:
          # Log individual trace processing errors but continue
          print(f'Warning: Failed to process trace {getattr(trace.info, "request_id", "unknown")}: {str(trace_error)}')
          continue

      return trace_info_list

    except Exception as e:
      error_msg = str(e)
      if '401' in error_msg or 'Credential' in error_msg:
        raise ValueError(f'MLflow authentication failed. Please check your Databricks token: {error_msg}')
      elif '404' in error_msg:
        raise ValueError(f'MLflow experiment not found. Please check your experiment ID: {error_msg}')
      else:
        raise ValueError(f'Failed to search MLflow traces: {error_msg}')

  def ingest_traces(self, workshop_id: str, config: MLflowIntakeConfig) -> int:
    """Ingest traces from MLflow into the workshop."""
    try:
      # Search for traces
      trace_infos = self.search_traces(config)

      if not trace_infos:
        return 0  # No traces found, return 0 instead of erroring

      # Convert to TraceUpload objects
      trace_uploads = []
      for trace_info in trace_infos:
        try:
          # Get full trace data
          full_trace = mlflow.get_trace(trace_info.trace_id)

          # Extract content from JSON input/output
          input_content = self._extract_content_from_json(full_trace.data.request)
          output_content = self._extract_content_from_json(full_trace.data.response)

          trace_upload = TraceUpload(
            input=input_content,
            output=output_content,
            context={
              'spans': [
                {
                  'name': span.name,
                  'span_type': span.span_type,
                  'inputs': span.inputs,
                  'outputs': span.outputs,
                  'start_time_ns': span.start_time_ns,
                  'end_time_ns': span.end_time_ns,
                }
                for span in full_trace.data.spans
              ],
              'execution_time_ms': full_trace.info.execution_time_ms,
              'status': full_trace.info.status,
              'tags': dict(full_trace.info.tags) if full_trace.info.tags else {},
            },
            trace_metadata={
              'mlflow_trace_id': trace_info.trace_id,
              'mlflow_host': config.databricks_host,
              'mlflow_experiment_id': config.experiment_id,
            },
            mlflow_trace_id=trace_info.trace_id,
            mlflow_url=self._generate_mlflow_url(config.databricks_host, config.experiment_id, trace_info.trace_id),
            mlflow_host=config.databricks_host,
            mlflow_experiment_id=config.experiment_id,
          )
          trace_uploads.append(trace_upload)

        except Exception as trace_error:
          # Log individual trace processing errors but continue
          print(f'Warning: Failed to process trace {trace_info.trace_id}: {str(trace_error)}')
          continue

      # Add traces to workshop
      if trace_uploads:
        self.db_service.add_traces(workshop_id, trace_uploads)

      return len(trace_uploads)

    except ValueError as e:
      # Re-raise ValueError (authentication, etc.) as-is
      raise e
    except Exception as e:
      error_msg = str(e)
      if '401' in error_msg or 'Credential' in error_msg:
        raise ValueError(f'MLflow authentication failed during ingestion: {error_msg}')
      else:
        raise ValueError(f'Failed to ingest traces: {error_msg}')

  def _truncate_text(self, text: str, max_length: int) -> str:
    """Truncate text to specified length."""
    if len(text) <= max_length:
      return text
    return text[:max_length] + '...'

  def _extract_content_from_json(self, json_text: str) -> str:
    """Extract content from JSON input/output format."""
    try:
      import json

      data = json.loads(json_text)

      # Handle the specific MLflow trace format with request.input structure
      if isinstance(data, dict) and 'request' in data:
        request_data = data['request']
        if isinstance(request_data, dict) and 'input' in request_data:
          input_list = request_data['input']
          if isinstance(input_list, list) and input_list:
            # Extract content from the first user message
            for item in input_list:
              if isinstance(item, dict) and item.get('role') == 'user' and 'content' in item:
                return item['content']
            # If no user message found, return the first item's content
            if input_list[0].get('content'):
              return input_list[0]['content']

      # Handle messages format: {"messages": [...]}
      if isinstance(data, dict) and 'messages' in data:
        messages = data['messages']
        if not messages:
          return json_text

        # First, try to find an assistant message (for output)
        for message in reversed(messages):
          if isinstance(message, dict) and message.get('role') == 'assistant' and 'content' in message:
            return message['content']

        # If no assistant message found, return the first user message (for input)
        for message in messages:
          if isinstance(message, dict) and message.get('role') == 'user' and 'content' in message:
            return message['content']

        # If no specific role found, return the last message content
        if messages and isinstance(messages[-1], dict) and 'content' in messages[-1]:
          return messages[-1]['content']

      # Handle output format with response items
      if isinstance(data, list):
        # Look for response.output_item.done type items
        for item in data:
          if isinstance(item, dict) and item.get('type') == 'response.output_item.done':
            item_data = item.get('item', {})
            if isinstance(item_data, dict) and 'content' in item_data:
              content_list = item_data['content']
              if isinstance(content_list, list):
                for content_item in content_list:
                  if isinstance(content_item, dict) and content_item.get('type') == 'output_text':
                    return content_item.get('text', '')

      # Handle new output format with object: "response"
      if isinstance(data, dict) and data.get('object') == 'response' and 'output' in data:
        output_list = data['output']
        if isinstance(output_list, list):
          for output_item in output_list:
            if isinstance(output_item, dict) and output_item.get('type') == 'message' and output_item.get('role') == 'assistant':
              content_list = output_item.get('content', [])
              if isinstance(content_list, list):
                for content_item in content_list:
                  if isinstance(content_item, dict) and content_item.get('type') == 'output_text':
                    return content_item.get('text', '')

      # If no specific format found, return the original text
      return json_text

    except (json.JSONDecodeError, KeyError, IndexError):
      # If JSON parsing fails, return the original text
      return json_text

  def _generate_mlflow_url(self, databricks_host: str, experiment_id: str, trace_id: str) -> str:
    """Generate MLflow URL for an experiment."""
    # Remove protocol if present
    host = databricks_host.replace('https://', '').replace('http://', '')
    # Use the experiment URL format: https://{host}/ml/experiments/{experiment_id}
    return f'https://{host}/ml/experiments/{experiment_id}/traces?selectedEvaluationId={trace_id}'

  def test_connection(self, config: MLflowIntakeConfig) -> Dict[str, Any]:
    """Test MLflow connection and return experiment info."""
    try:
      # Configure MLflow
      self.configure_mlflow(config)

      # Try to get experiment info
      experiment = mlflow.get_experiment(config.experiment_id)
      if not experiment:
        return {
          'success': False,
          'error': 'Experiment not found',
          'message': f'Experiment {config.experiment_id} not found',
        }

      # Try to search for traces to verify access (with minimal request)
      try:
        traces = mlflow.search_traces(
          experiment_ids=[config.experiment_id],
          max_results=1,  # Just get one trace to test access
          return_type='list',
        )
        trace_count = len(traces)
      except Exception as trace_error:
        # If we can access experiment but not traces, still consider it a partial success
        trace_count = 0
        print(f'Warning: Could not search traces: {str(trace_error)}')

      return {
        'success': True,
        'experiment_name': experiment.name,
        'experiment_id': config.experiment_id,
        'trace_count': trace_count,
        'message': f"Connection successful. Found experiment '{experiment.name}' accessible traces.",
      }

    except Exception as e:
      error_msg = str(e)
      if '401' in error_msg or 'Credential' in error_msg:
        return {
          'success': False,
          'error': 'Authentication failed',
          'message': 'MLflow authentication failed. Please check your Databricks token and permissions.',
        }
      elif '404' in error_msg:
        return {
          'success': False,
          'error': 'Experiment not found',
          'message': f'Experiment {config.experiment_id} not found. Please check your experiment ID.',
        }
      else:
        return {'success': False, 'error': str(e), 'message': f'Connection failed: {str(e)}'}
