/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about an MLflow trace.
 */
export type MLflowTraceInfo = {
    trace_id: string;
    request_preview: string;
    response_preview: string;
    execution_time_ms?: (number | null);
    status: string;
    timestamp_ms: number;
    tags?: (Record<string, string> | null);
    mlflow_url?: (string | null);
};

