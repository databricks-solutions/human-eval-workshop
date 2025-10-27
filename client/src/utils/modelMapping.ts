/**
 * Model mapping utilities for Databricks endpoints
 * Maps frontend display names to backend model names
 */

export interface ModelOption {
  value: string;           // Backend model name (e.g., "databricks-claude-3-7-sonnet")
  label: string;           // Frontend display name (e.g., "Claude 3.7 Sonnet")
  description?: string;    // Optional description
  disabled?: boolean;      // Whether this option is disabled
  requiresDatabricks?: boolean; // Whether this requires Databricks configuration
}

/**
 * Mapping of frontend display names to backend model names
 */
export const MODEL_MAPPING: Record<string, string> = {
  // Claude models
  'Claude 3.7 Sonnet': 'databricks-claude-3-7-sonnet',
  'Claude Sonnet 4': 'databricks-claude-sonnet-4',
  // Llama models
  'Llama 3.3 70B Instruct': 'databricks-meta-llama-3-3-70b-instruct',
  'Llama 4 Maverick': 'databricks-llama-4-maverick',
  // OpenAI models
  'GPT OSS 120B': 'databricks-gpt-oss-120b',
  'GPT OSS 20B': 'databricks-gpt-oss-20b',
  
};

/**
 * Reverse mapping from backend model names to frontend display names
 */
export const REVERSE_MODEL_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(MODEL_MAPPING).map(([key, value]) => [value, key])
);

/**
 * Get the backend model name from a frontend display name
 */
export function getBackendModelName(frontendName: string): string {
  return MODEL_MAPPING[frontendName] || frontendName;
}

/**
 * Get the frontend display name from a backend model name
 */
export function getFrontendModelName(backendName: string): string {
  return REVERSE_MODEL_MAPPING[backendName] || backendName;
}

/**
 * Get all available model options for the UI
 */
export function getModelOptions(hasMlflowConfig: boolean = false): ModelOption[] {
  return [
    {
      value: 'Claude 3.7 Sonnet',
      label: 'Claude 3.7 Sonnet',
      description: 'Anthropic Claude 3.7 Sonnet model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
    {
      value: 'Claude Sonnet 4',
      label: 'Claude Sonnet 4',
      description: 'Anthropic Claude Sonnet 4 model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
    {
      value: 'Llama 3.3 70B Instruct',
      label: 'Llama 3.3 70B Instruct',
      description: 'Meta Llama 3.3 70B Instruct model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
    {
      value: 'Llama 4 Maverick',
      label: 'Llama 4 Maverick',
      description: 'Meta Llama 4 Maverick model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
    {
      value: 'GPT OSS 120B',
      label: 'GPT OSS 120B',
      description: 'Open Source GPT 120B model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
    {
      value: 'GPT OSS 20B',
      label: 'GPT OSS 20B',
      description: 'Open Source GPT 20B model',
      disabled: !hasMlflowConfig,
      requiresDatabricks: true,
    },
  ];
}

/**
 * Get model option by value
 */
export function getModelOptionByValue(value: string, hasMlflowConfig: boolean = false): ModelOption | undefined {
  return getModelOptions(hasMlflowConfig).find(option => option.value === value);
}

/**
 * Get model option by backend name
 */
export function getModelOptionByBackendName(backendName: string, hasMlflowConfig: boolean = false): ModelOption | undefined {
  const frontendName = getFrontendModelName(backendName);
  return getModelOptionByValue(frontendName, hasMlflowConfig);
}

/**
 * Check if a model requires Databricks configuration
 */
export function requiresDatabricks(modelName: string): boolean {
  const option = getModelOptionByValue(modelName);
  return option?.requiresDatabricks || false;
}

/**
 * Get a user-friendly display name for a model
 */
export function getDisplayName(modelName: string): string {
  const option = getModelOptionByValue(modelName);
  return option?.label || modelName;
}
