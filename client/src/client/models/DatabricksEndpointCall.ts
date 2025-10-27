/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for calling a Databricks serving endpoint.
 */
export type DatabricksEndpointCall = {
    /**
     * Name of the serving endpoint
     */
    endpoint_name: string;
    /**
     * The prompt to send to the model
     */
    prompt: string;
    /**
     * Temperature for generation
     */
    temperature?: number;
    /**
     * Maximum number of tokens to generate
     */
    max_tokens?: (number | null);
    /**
     * Additional model parameters
     */
    model_parameters?: (Record<string, any> | null);
};

