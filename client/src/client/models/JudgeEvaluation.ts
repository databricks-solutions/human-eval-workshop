/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Judge evaluation result for a single trace.
 */
export type JudgeEvaluation = {
    id: string;
    workshop_id: string;
    prompt_id: string;
    trace_id: string;
    predicted_rating: number;
    human_rating: number;
    confidence?: (number | null);
    reasoning?: (string | null);
};

