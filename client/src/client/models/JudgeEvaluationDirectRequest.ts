/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for evaluating a judge prompt without saving it.
 */
export type JudgeEvaluationDirectRequest = {
    prompt_text: string;
    model_name?: string;
    model_parameters?: (Record<string, any> | null);
    /**
     * Specific traces to evaluate, or None for all
     */
    trace_ids?: (Array<string> | null);
};

