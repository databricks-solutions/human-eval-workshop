/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DatabricksChatMessage } from './DatabricksChatMessage';
/**
 * Request model for Databricks chat completion.
 */
export type DatabricksChatCompletion = {
    /**
     * Name of the serving endpoint
     */
    endpoint_name: string;
    /**
     * List of messages for chat completion
     */
    messages: Array<DatabricksChatMessage>;
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

