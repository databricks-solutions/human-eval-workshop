/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Judge prompt model.
 */
export type JudgePrompt = {
    id: string;
    workshop_id: string;
    prompt_text: string;
    version: number;
    few_shot_examples?: Array<string>;
    model_name?: string;
    model_parameters?: (Record<string, any> | null);
    created_by: string;
    created_at?: string;
    performance_metrics?: (Record<string, any> | null);
};

