/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a judge prompt.
 */
export type JudgePromptCreate = {
    /**
     * The judge prompt text
     */
    prompt_text: string;
    /**
     * Selected few-shot example trace IDs
     */
    few_shot_examples?: (Array<string> | null);
    /**
     * Model to use: demo, databricks-dbrx-instruct, openai-gpt-4, etc.
     */
    model_name?: (string | null);
    /**
     * Model parameters like temperature
     */
    model_parameters?: (Record<string, any> | null);
};

