/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JudgeEvaluation } from './JudgeEvaluation';
import type { JudgePerformanceMetrics } from './JudgePerformanceMetrics';
/**
 * Result from direct evaluation including both metrics and individual evaluations.
 */
export type JudgeEvaluationResult = {
    metrics: JudgePerformanceMetrics;
    evaluations: Array<JudgeEvaluation>;
};

