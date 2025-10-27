/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for Databricks API calls.
 */
export type DatabricksResponse = {
    /**
     * Whether the request was successful
     */
    success: boolean;
    /**
     * Response data from the model
     */
    data?: (Record<string, any> | null);
    /**
     * Error message if request failed
     */
    error?: (string | null);
    /**
     * Name of the endpoint that was called
     */
    endpoint_name: string;
    /**
     * Timestamp of the request
     */
    timestamp?: string;
};

