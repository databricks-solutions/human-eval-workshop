/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_call_chat_completion_databricks_chat_post } from '../models/Body_call_chat_completion_databricks_chat_post';
import type { Body_call_serving_endpoint_databricks_call_post } from '../models/Body_call_serving_endpoint_databricks_call_post';
import type { DatabricksConfig } from '../models/DatabricksConfig';
import type { DatabricksConnectionTest } from '../models/DatabricksConnectionTest';
import type { DatabricksEndpointInfo } from '../models/DatabricksEndpointInfo';
import type { DatabricksResponse } from '../models/DatabricksResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DatabricksService {
    /**
     * Test Databricks Connection
     * Test the connection to a Databricks workspace.
     *
     * Args:
     * config: Databricks workspace configuration
     *
     * Returns:
     * Connection test results
     * @param requestBody
     * @returns DatabricksConnectionTest Successful Response
     * @throws ApiError
     */
    public static testDatabricksConnectionDatabricksTestConnectionPost(
        requestBody: DatabricksConfig,
    ): CancelablePromise<DatabricksConnectionTest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databricks/test-connection',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Serving Endpoints
     * List all available serving endpoints in the Databricks workspace.
     *
     * Args:
     * config: Databricks workspace configuration
     *
     * Returns:
     * List of serving endpoint information
     * @param requestBody
     * @returns DatabricksEndpointInfo Successful Response
     * @throws ApiError
     */
    public static listServingEndpointsDatabricksEndpointsGet(
        requestBody: DatabricksConfig,
    ): CancelablePromise<Array<DatabricksEndpointInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/databricks/endpoints',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Endpoint Info
     * Get detailed information about a specific serving endpoint.
     *
     * Args:
     * endpoint_name: Name of the serving endpoint
     * config: Databricks workspace configuration
     *
     * Returns:
     * Detailed endpoint information
     * @param endpointName
     * @param requestBody
     * @returns DatabricksEndpointInfo Successful Response
     * @throws ApiError
     */
    public static getEndpointInfoDatabricksEndpointsEndpointNameGet(
        endpointName: string,
        requestBody: DatabricksConfig,
    ): CancelablePromise<DatabricksEndpointInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/databricks/endpoints/{endpoint_name}',
            path: {
                'endpoint_name': endpointName,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Call Serving Endpoint
     * Call a Databricks serving endpoint with a prompt.
     *
     * Args:
     * request: Endpoint call request with prompt and parameters
     * config: Databricks workspace configuration
     *
     * Returns:
     * Response from the model
     * @param requestBody
     * @returns DatabricksResponse Successful Response
     * @throws ApiError
     */
    public static callServingEndpointDatabricksCallPost(
        requestBody: Body_call_serving_endpoint_databricks_call_post,
    ): CancelablePromise<DatabricksResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databricks/call',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Call Chat Completion
     * Call a Databricks serving endpoint using chat completion format.
     *
     * Args:
     * request: Chat completion request with messages
     * config: Databricks workspace configuration
     *
     * Returns:
     * Response from the model
     * @param requestBody
     * @returns DatabricksResponse Successful Response
     * @throws ApiError
     */
    public static callChatCompletionDatabricksChatPost(
        requestBody: Body_call_chat_completion_databricks_chat_post,
    ): CancelablePromise<DatabricksResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databricks/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Evaluate Judge Prompt
     * Evaluate a judge prompt using Databricks serving endpoint.
     * This is specifically designed for judge evaluation with default parameters.
     *
     * Args:
     * request: Dictionary containing endpoint_name, prompt, config, temperature, max_tokens
     * db: Database session
     *
     * Returns:
     * Response from the model
     * @param requestBody
     * @returns DatabricksResponse Successful Response
     * @throws ApiError
     */
    public static evaluateJudgePromptDatabricksJudgeEvaluatePost(
        requestBody: Record<string, any>,
    ): CancelablePromise<DatabricksResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databricks/judge-evaluate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Simple Endpoint Call
     * Simple endpoint call for testing purposes.
     *
     * Args:
     * endpoint_name: Name of the serving endpoint
     * prompt: The prompt to send
     * temperature: Temperature for generation
     * max_tokens: Maximum tokens to generate
     * workspace_url: Databricks workspace URL
     * token: Databricks API token
     *
     * Returns:
     * Response from the model
     * @param endpointName
     * @param prompt
     * @param temperature
     * @param maxTokens
     * @param workspaceUrl
     * @param token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static simpleEndpointCallDatabricksSimpleCallPost(
        endpointName: string,
        prompt: string,
        temperature: number = 0.5,
        maxTokens?: number,
        workspaceUrl?: string,
        token?: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databricks/simple-call',
            query: {
                'endpoint_name': endpointName,
                'prompt': prompt,
                'temperature': temperature,
                'max_tokens': maxTokens,
                'workspace_url': workspaceUrl,
                'token': token,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
