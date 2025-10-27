/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Configuration for exporting a judge.
 */
export type JudgeExportConfig = {
    prompt_id: string;
    /**
     * Export format: json, python, or api
     */
    export_format?: string;
    /**
     * Include few-shot examples in export
     */
    include_examples?: boolean;
};

