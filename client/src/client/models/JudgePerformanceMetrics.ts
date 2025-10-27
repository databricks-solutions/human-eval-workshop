/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Performance metrics for a judge prompt.
 */
export type JudgePerformanceMetrics = {
    prompt_id: string;
    correlation: number;
    accuracy: number;
    mean_absolute_error: number;
    agreement_by_rating: Record<string, number>;
    confusion_matrix: Array<Array<number>>;
    total_evaluations: number;
};

