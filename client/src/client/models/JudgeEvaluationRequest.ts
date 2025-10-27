/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for evaluating a judge prompt.
 */
export type JudgeEvaluationRequest = {
    prompt_id: string;
    /**
     * Specific traces to evaluate, or None for all
     */
    trace_ids?: (Array<string> | null);
    /**
     * Override model selection from UI (e.g., 'demo' to force simulation)
     */
    override_model?: (string | null);
};

