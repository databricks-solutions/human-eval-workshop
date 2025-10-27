/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Model for connection test results.
 */
export type DatabricksConnectionTest = {
    /**
     * Connection status (connected/failed)
     */
    status: string;
    /**
     * Workspace URL that was tested
     */
    workspace_url: string;
    /**
     * Number of available endpoints
     */
    endpoints_count?: (number | null);
    /**
     * Error message if connection failed
     */
    error?: (string | null);
    /**
     * Human-readable status message
     */
    message: string;
};

