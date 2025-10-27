/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Model for serving endpoint information.
 */
export type DatabricksEndpointInfo = {
    /**
     * Name of the serving endpoint
     */
    name: string;
    /**
     * Unique identifier of the endpoint
     */
    id: string;
    /**
     * Current state of the endpoint
     */
    state?: (string | null);
    /**
     * Endpoint configuration
     */
    config?: (Record<string, any> | null);
    /**
     * Creator of the endpoint
     */
    creator?: (string | null);
    /**
     * Creation timestamp
     */
    created_at?: (string | null);
    /**
     * Last update timestamp
     */
    updated_at?: (string | null);
};

