/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Annotation } from '../models/Annotation';
import type { AnnotationCreate } from '../models/AnnotationCreate';
import type { AuthResponse } from '../models/AuthResponse';
import type { Body_call_chat_completion_databricks_chat_post } from '../models/Body_call_chat_completion_databricks_chat_post';
import type { Body_call_serving_endpoint_databricks_call_post } from '../models/Body_call_serving_endpoint_databricks_call_post';
import type { DatabricksConfig } from '../models/DatabricksConfig';
import type { DatabricksConnectionTest } from '../models/DatabricksConnectionTest';
import type { DatabricksEndpointInfo } from '../models/DatabricksEndpointInfo';
import type { DatabricksResponse } from '../models/DatabricksResponse';
import type { DBSQLExportRequest } from '../models/DBSQLExportRequest';
import type { DBSQLExportResponse } from '../models/DBSQLExportResponse';
import type { DiscoveryFinding } from '../models/DiscoveryFinding';
import type { DiscoveryFindingCreate } from '../models/DiscoveryFindingCreate';
import type { FacilitatorConfigCreate } from '../models/FacilitatorConfigCreate';
import type { IRRResult } from '../models/IRRResult';
import type { JudgeEvaluation } from '../models/JudgeEvaluation';
import type { JudgeEvaluationDirectRequest } from '../models/JudgeEvaluationDirectRequest';
import type { JudgeEvaluationRequest } from '../models/JudgeEvaluationRequest';
import type { JudgeEvaluationResult } from '../models/JudgeEvaluationResult';
import type { JudgeExportConfig } from '../models/JudgeExportConfig';
import type { JudgePerformanceMetrics } from '../models/JudgePerformanceMetrics';
import type { JudgePrompt } from '../models/JudgePrompt';
import type { JudgePromptCreate } from '../models/JudgePromptCreate';
import type { MLflowIntakeConfig } from '../models/MLflowIntakeConfig';
import type { MLflowIntakeConfigCreate } from '../models/MLflowIntakeConfigCreate';
import type { MLflowIntakeStatus } from '../models/MLflowIntakeStatus';
import type { MLflowTraceInfo } from '../models/MLflowTraceInfo';
import type { Rubric } from '../models/Rubric';
import type { RubricCreate } from '../models/RubricCreate';
import type { Trace } from '../models/Trace';
import type { TraceUpload } from '../models/TraceUpload';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';
import type { UserInvite } from '../models/UserInvite';
import type { UserLogin } from '../models/UserLogin';
import type { UserPermissions } from '../models/UserPermissions';
import type { UserRole } from '../models/UserRole';
import type { UserStatus } from '../models/UserStatus';
import type { Workshop } from '../models/Workshop';
import type { WorkshopCreate } from '../models/WorkshopCreate';
import type { WorkshopParticipant } from '../models/WorkshopParticipant';
import type { WorkshopPhase } from '../models/WorkshopPhase';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * Create Workshop
     * Create a new workshop.
     * @param requestBody
     * @returns Workshop Successful Response
     * @throws ApiError
     */
    public static createWorkshopWorkshopsPost(
        requestBody: WorkshopCreate,
    ): CancelablePromise<Workshop> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Workshop
     * Get workshop details.
     * @param workshopId
     * @returns Workshop Successful Response
     * @throws ApiError
     */
    public static getWorkshopWorkshopsWorkshopIdGet(
        workshopId: string,
    ): CancelablePromise<Workshop> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Traces
     * Upload traces to a workshop.
     * @param workshopId
     * @param requestBody
     * @returns Trace Successful Response
     * @throws ApiError
     */
    public static uploadTracesWorkshopsWorkshopIdTracesPost(
        workshopId: string,
        requestBody: Array<TraceUpload>,
    ): CancelablePromise<Array<Trace>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/traces',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Traces
     * Get traces for a workshop in user-specific order.
     *
     * Args:
     * workshop_id: The workshop ID
     * user_id: The user ID (REQUIRED for personalized trace ordering)
     * db: Database session
     *
     * Returns:
     * List of traces in user-specific order
     *
     * Raises:
     * HTTPException: If workshop not found or user_id not provided
     * @param workshopId
     * @param userId
     * @returns Trace Successful Response
     * @throws ApiError
     */
    public static getTracesWorkshopsWorkshopIdTracesGet(
        workshopId: string,
        userId: string,
    ): CancelablePromise<Array<Trace>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/traces',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get All Traces
     * Get ALL traces for a workshop, unfiltered by phase.
     * @param workshopId
     * @returns Trace Successful Response
     * @throws ApiError
     */
    public static getAllTracesWorkshopsWorkshopIdAllTracesGet(
        workshopId: string,
    ): CancelablePromise<Array<Trace>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/all-traces',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Original Traces
     * Get only the original intake traces for a workshop (no duplicates).
     *
     * This endpoint is used for judge tuning where we only want to evaluate
     * the original traces, not multiple instances from different annotators.
     * @param workshopId
     * @returns Trace Successful Response
     * @throws ApiError
     */
    public static getOriginalTracesWorkshopsWorkshopIdOriginalTracesGet(
        workshopId: string,
    ): CancelablePromise<Array<Trace>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/original-traces',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Finding
     * Submit a discovery finding.
     * @param workshopId
     * @param requestBody
     * @returns DiscoveryFinding Successful Response
     * @throws ApiError
     */
    public static submitFindingWorkshopsWorkshopIdFindingsPost(
        workshopId: string,
        requestBody: DiscoveryFindingCreate,
    ): CancelablePromise<DiscoveryFinding> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/findings',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Findings
     * Get discovery findings for a workshop, optionally filtered by user.
     * @param workshopId
     * @param userId
     * @returns DiscoveryFinding Successful Response
     * @throws ApiError
     */
    public static getFindingsWorkshopsWorkshopIdFindingsGet(
        workshopId: string,
        userId?: (string | null),
    ): CancelablePromise<Array<DiscoveryFinding>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/findings',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Clear Findings
     * Clear all findings for a workshop (for testing).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static clearFindingsWorkshopsWorkshopIdFindingsDelete(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/workshops/{workshop_id}/findings',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Findings With User Details
     * Get discovery findings with user details for facilitator view.
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFindingsWithUserDetailsWorkshopsWorkshopIdFindingsWithUsersGet(
        workshopId: string,
        userId?: (string | null),
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/findings-with-users',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Rubric
     * Create or update rubric for a workshop.
     * @param workshopId
     * @param requestBody
     * @returns Rubric Successful Response
     * @throws ApiError
     */
    public static createRubricWorkshopsWorkshopIdRubricPost(
        workshopId: string,
        requestBody: RubricCreate,
    ): CancelablePromise<Rubric> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/rubric',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Rubric
     * Update rubric for a workshop.
     * @param workshopId
     * @param requestBody
     * @returns Rubric Successful Response
     * @throws ApiError
     */
    public static updateRubricWorkshopsWorkshopIdRubricPut(
        workshopId: string,
        requestBody: RubricCreate,
    ): CancelablePromise<Rubric> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/workshops/{workshop_id}/rubric',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Rubric
     * Get rubric for a workshop.
     * @param workshopId
     * @returns Rubric Successful Response
     * @throws ApiError
     */
    public static getRubricWorkshopsWorkshopIdRubricGet(
        workshopId: string,
    ): CancelablePromise<Rubric> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/rubric',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Clear Rubric
     * Clear the rubric for a workshop (for testing).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static clearRubricWorkshopsWorkshopIdRubricDelete(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/workshops/{workshop_id}/rubric',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Rubric Question
     * Update a specific question in the rubric.
     * @param workshopId
     * @param questionId
     * @param requestBody
     * @returns Rubric Successful Response
     * @throws ApiError
     */
    public static updateRubricQuestionWorkshopsWorkshopIdRubricQuestionsQuestionIdPut(
        workshopId: string,
        questionId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<Rubric> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/workshops/{workshop_id}/rubric/questions/{question_id}',
            path: {
                'workshop_id': workshopId,
                'question_id': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Rubric Question
     * Delete a specific question from the rubric.
     * @param workshopId
     * @param questionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteRubricQuestionWorkshopsWorkshopIdRubricQuestionsQuestionIdDelete(
        workshopId: string,
        questionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/workshops/{workshop_id}/rubric/questions/{question_id}',
            path: {
                'workshop_id': workshopId,
                'question_id': questionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Annotation
     * Submit an annotation for a trace.
     * @param workshopId
     * @param requestBody
     * @returns Annotation Successful Response
     * @throws ApiError
     */
    public static submitAnnotationWorkshopsWorkshopIdAnnotationsPost(
        workshopId: string,
        requestBody: AnnotationCreate,
    ): CancelablePromise<Annotation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/annotations',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Annotations
     * Get annotations for a workshop, optionally filtered by user.
     * @param workshopId
     * @param userId
     * @returns Annotation Successful Response
     * @throws ApiError
     */
    public static getAnnotationsWorkshopsWorkshopIdAnnotationsGet(
        workshopId: string,
        userId?: (string | null),
    ): CancelablePromise<Array<Annotation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/annotations',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Clear Annotations
     * Clear all annotations for a workshop (for testing).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static clearAnnotationsWorkshopsWorkshopIdAnnotationsDelete(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/workshops/{workshop_id}/annotations',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Annotations With User Details
     * Get annotations with user details for facilitator view.
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAnnotationsWithUserDetailsWorkshopsWorkshopIdAnnotationsWithUsersGet(
        workshopId: string,
        userId?: (string | null),
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/annotations-with-users',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Irr
     * Calculate Inter-Rater Reliability for a workshop.
     * @param workshopId
     * @returns IRRResult Successful Response
     * @throws ApiError
     */
    public static getIrrWorkshopsWorkshopIdIrrGet(
        workshopId: string,
    ): CancelablePromise<IRRResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/irr',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Begin Discovery Phase
     * Begin the discovery phase and distribute traces to participants.
     *
     * Args:
     * workshop_id: The workshop ID
     * trace_limit: Optional limit on number of traces to use (default: all)
     * db: Database session
     * @param workshopId
     * @param traceLimit
     * @returns any Successful Response
     * @throws ApiError
     */
    public static beginDiscoveryPhaseWorkshopsWorkshopIdBeginDiscoveryPost(
        workshopId: string,
        traceLimit?: (number | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/begin-discovery',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'trace_limit': traceLimit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Traces
     * Add additional traces to the current active phase (discovery or annotation).
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addTracesWorkshopsWorkshopIdAddTracesPost(
        workshopId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/add-traces',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Discovery Traces
     * Add additional traces to the active discovery phase (legacy endpoint).
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addDiscoveryTracesWorkshopsWorkshopIdAddDiscoveryTracesPost(
        workshopId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/add-discovery-traces',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Annotation Traces
     * Add additional traces to the annotation phase (legacy endpoint).
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addAnnotationTracesWorkshopsWorkshopIdAddAnnotationTracesPost(
        workshopId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/add-annotation-traces',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reorder Annotation Traces
     * Reorder annotation traces so completed ones come first, then in-progress ones.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reorderAnnotationTracesWorkshopsWorkshopIdReorderAnnotationTracesPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/reorder-annotation-traces',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Begin Annotation Phase
     * Begin the annotation phase with a subset of traces.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static beginAnnotationPhaseWorkshopsWorkshopIdBeginAnnotationPost(
        workshopId: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/begin-annotation',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Discovery
     * Advance workshop from INTAKE to DISCOVERY phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToDiscoveryWorkshopsWorkshopIdAdvanceToDiscoveryPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-discovery',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Rubric
     * Advance workshop from DISCOVERY to RUBRIC phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToRubricWorkshopsWorkshopIdAdvanceToRubricPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-rubric',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Annotation
     * Advance workshop from RUBRIC to ANNOTATION phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToAnnotationWorkshopsWorkshopIdAdvanceToAnnotationPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-annotation',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Results
     * Advance workshop from ANNOTATION to RESULTS phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToResultsWorkshopsWorkshopIdAdvanceToResultsPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-results',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance Workshop Phase
     * Generic phase advancement - use specific endpoints instead (facilitator only).
     * @param workshopId
     * @param targetPhase
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceWorkshopPhaseWorkshopsWorkshopIdAdvancePhasePost(
        workshopId: string,
        targetPhase: WorkshopPhase,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-phase',
            path: {
                'workshop_id': workshopId,
            },
            query: {
                'target_phase': targetPhase,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Workshop Participants
     * Get all participants for a workshop.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkshopParticipantsWorkshopsWorkshopIdParticipantsGet(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/participants',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Discovery Test Data
     * Generate realistic discovery findings for testing.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateDiscoveryTestDataWorkshopsWorkshopIdGenerateDiscoveryDataPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/generate-discovery-data',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Rubric Test Data
     * Generate realistic rubric for testing.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateRubricTestDataWorkshopsWorkshopIdGenerateRubricDataPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/generate-rubric-data',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Annotation Test Data
     * Generate realistic annotations for testing.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateAnnotationTestDataWorkshopsWorkshopIdGenerateAnnotationDataPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/generate-annotation-data',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Test Data
     * Generate all test data (rubric + annotations) for development.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateTestDataWorkshopsWorkshopIdGenerateTestDataPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/generate-test-data',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Judge Tuning
     * Advance workshop from ANNOTATION or RESULTS to JUDGE_TUNING phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToJudgeTuningWorkshopsWorkshopIdAdvanceToJudgeTuningPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-judge-tuning',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Advance To Unity Volume
     * Advance workshop from JUDGE_TUNING to UNITY_VOLUME phase (facilitator only).
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static advanceToUnityVolumeWorkshopsWorkshopIdAdvanceToUnityVolumePost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/advance-to-unity-volume',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Workshop To Volume
     * Upload workshop SQLite database to Unity Catalog volume using provided credentials.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadWorkshopToVolumeWorkshopsWorkshopIdUploadToVolumePost(
        workshopId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/upload-to-volume',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Download Workshop Database
     * Download the workshop SQLite database file.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadWorkshopDatabaseWorkshopsWorkshopIdDownloadDatabaseGet(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/download-database',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Phase
     * Mark a phase as completed (facilitator only).
     * @param workshopId
     * @param phase
     * @returns any Successful Response
     * @throws ApiError
     */
    public static completePhaseWorkshopsWorkshopIdCompletePhasePhasePost(
        workshopId: string,
        phase: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/complete-phase/{phase}',
            path: {
                'workshop_id': workshopId,
                'phase': phase,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resume Phase
     * Resume a completed phase (facilitator only).
     * @param workshopId
     * @param phase
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resumePhaseWorkshopsWorkshopIdResumePhasePhasePost(
        workshopId: string,
        phase: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/resume-phase/{phase}',
            path: {
                'workshop_id': workshopId,
                'phase': phase,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Judge Prompt
     * Create a new judge prompt.
     * @param workshopId
     * @param requestBody
     * @returns JudgePrompt Successful Response
     * @throws ApiError
     */
    public static createJudgePromptWorkshopsWorkshopIdJudgePromptsPost(
        workshopId: string,
        requestBody: JudgePromptCreate,
    ): CancelablePromise<JudgePrompt> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/judge-prompts',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Judge Prompts
     * Get all judge prompts for a workshop.
     * @param workshopId
     * @returns JudgePrompt Successful Response
     * @throws ApiError
     */
    public static getJudgePromptsWorkshopsWorkshopIdJudgePromptsGet(
        workshopId: string,
    ): CancelablePromise<Array<JudgePrompt>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/judge-prompts',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Judge Prompt Metrics
     * Update performance metrics for a judge prompt.
     * @param workshopId
     * @param promptId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateJudgePromptMetricsWorkshopsWorkshopIdJudgePromptsPromptIdMetricsPut(
        workshopId: string,
        promptId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/workshops/{workshop_id}/judge-prompts/{prompt_id}/metrics',
            path: {
                'workshop_id': workshopId,
                'prompt_id': promptId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Evaluate Judge Prompt
     * Evaluate a judge prompt against human annotations.
     * @param workshopId
     * @param requestBody
     * @returns JudgePerformanceMetrics Successful Response
     * @throws ApiError
     */
    public static evaluateJudgePromptWorkshopsWorkshopIdEvaluateJudgePost(
        workshopId: string,
        requestBody: JudgeEvaluationRequest,
    ): CancelablePromise<JudgePerformanceMetrics> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/evaluate-judge',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Evaluate Judge Prompt Direct
     * Evaluate a judge prompt directly without saving it to history.
     * @param workshopId
     * @param requestBody
     * @returns JudgeEvaluationResult Successful Response
     * @throws ApiError
     */
    public static evaluateJudgePromptDirectWorkshopsWorkshopIdEvaluateJudgeDirectPost(
        workshopId: string,
        requestBody: JudgeEvaluationDirectRequest,
    ): CancelablePromise<JudgeEvaluationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/evaluate-judge-direct',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Judge Evaluations
     * Get evaluation results for a specific judge prompt.
     * @param workshopId
     * @param promptId
     * @returns JudgeEvaluation Successful Response
     * @throws ApiError
     */
    public static getJudgeEvaluationsWorkshopsWorkshopIdJudgeEvaluationsPromptIdGet(
        workshopId: string,
        promptId: string,
    ): CancelablePromise<Array<JudgeEvaluation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/judge-evaluations/{prompt_id}',
            path: {
                'workshop_id': workshopId,
                'prompt_id': promptId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Save Judge Evaluations
     * Save evaluation results for a specific judge prompt.
     * @param workshopId
     * @param promptId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static saveJudgeEvaluationsWorkshopsWorkshopIdJudgeEvaluationsPromptIdPost(
        workshopId: string,
        promptId: string,
        requestBody: Array<JudgeEvaluation>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/judge-evaluations/{prompt_id}',
            path: {
                'workshop_id': workshopId,
                'prompt_id': promptId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Judge
     * Export a judge configuration.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportJudgeWorkshopsWorkshopIdExportJudgePost(
        workshopId: string,
        requestBody: JudgeExportConfig,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/export-judge',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Configure Mlflow Intake
     * Configure MLflow intake for a workshop (token stored in memory, not database).
     * @param workshopId
     * @param requestBody
     * @returns MLflowIntakeConfig Successful Response
     * @throws ApiError
     */
    public static configureMlflowIntakeWorkshopsWorkshopIdMlflowConfigPost(
        workshopId: string,
        requestBody: MLflowIntakeConfigCreate,
    ): CancelablePromise<MLflowIntakeConfig> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/mlflow-config',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Mlflow Config
     * Get MLflow intake configuration for a workshop.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getMlflowConfigWorkshopsWorkshopIdMlflowConfigGet(
        workshopId: string,
    ): CancelablePromise<(MLflowIntakeConfig | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/mlflow-config',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Mlflow Intake Status
     * Get MLflow intake status for a workshop.
     * @param workshopId
     * @returns MLflowIntakeStatus Successful Response
     * @throws ApiError
     */
    public static getMlflowIntakeStatusWorkshopsWorkshopIdMlflowStatusGet(
        workshopId: string,
    ): CancelablePromise<MLflowIntakeStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/mlflow-status',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Test Mlflow Connection
     * Test MLflow connection and return experiment info.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testMlflowConnectionWorkshopsWorkshopIdMlflowTestConnectionPost(
        workshopId: string,
        requestBody: MLflowIntakeConfigCreate,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/mlflow-test-connection',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Ingest Mlflow Traces
     * Ingest traces from MLflow into the workshop.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static ingestMlflowTracesWorkshopsWorkshopIdMlflowIngestPost(
        workshopId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/mlflow-ingest',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Mlflow Traces
     * Get available traces from MLflow (without ingesting).
     * @param workshopId
     * @param requestBody
     * @returns MLflowTraceInfo Successful Response
     * @throws ApiError
     */
    public static getMlflowTracesWorkshopsWorkshopIdMlflowTracesGet(
        workshopId: string,
        requestBody: MLflowIntakeConfigCreate,
    ): CancelablePromise<Array<MLflowTraceInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/mlflow-traces',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark User Discovery Complete
     * Mark a user as having completed discovery for a workshop.
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markUserDiscoveryCompleteWorkshopsWorkshopIdUsersUserIdCompleteDiscoveryPost(
        workshopId: string,
        userId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/users/{user_id}/complete-discovery',
            path: {
                'workshop_id': workshopId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Discovery Completion Status
     * Get discovery completion status for all users in a workshop.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDiscoveryCompletionStatusWorkshopsWorkshopIdDiscoveryCompletionStatusGet(
        workshopId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/discovery-completion-status',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Is User Discovery Complete
     * Check if a user has completed discovery for a workshop.
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static isUserDiscoveryCompleteWorkshopsWorkshopIdUsersUserIdDiscoveryCompleteGet(
        workshopId: string,
        userId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workshops/{workshop_id}/users/{user_id}/discovery-complete',
            path: {
                'workshop_id': workshopId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Migrate Annotations To Multi Metric
     * Migrate old annotations (with single 'rating' field) to new format (with 'ratings' dict).
     * This populates the 'ratings' dictionary by copying the legacy 'rating' value to all rubric questions.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static migrateAnnotationsToMultiMetricWorkshopsWorkshopIdMigrateAnnotationsPost(
        workshopId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/workshops/{workshop_id}/migrate-annotations',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * Authenticate a user with email and password.
     * @param requestBody
     * @returns AuthResponse Successful Response
     * @throws ApiError
     */
    public static loginUsersAuthLoginPost(
        requestBody: UserLogin,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create User
     * Create a new user (no authentication required).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createUserUsersPost(
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Users
     * List users, optionally filtered by workshop or role.
     * @param workshopId
     * @param role
     * @returns User Successful Response
     * @throws ApiError
     */
    public static listUsersUsersGet(
        workshopId?: (string | null),
        role?: (UserRole | null),
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/',
            query: {
                'workshop_id': workshopId,
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Facilitator Configs
     * List all pre-configured facilitators (admin only).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listFacilitatorConfigsUsersAdminFacilitatorsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/admin/facilitators/',
        });
    }
    /**
     * Create Facilitator Config
     * Create a pre-configured facilitator (admin only).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createFacilitatorConfigUsersAdminFacilitatorsPost(
        requestBody: FacilitatorConfigCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/admin/facilitators/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Invitation
     * Create a new user invitation (facilitators only).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createInvitationUsersInvitationsPost(
        requestBody: UserInvite,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/invitations/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Invitations
     * List invitations (facilitators only).
     * @param workshopId
     * @param status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listInvitationsUsersInvitationsGet(
        workshopId?: (string | null),
        status?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/invitations/',
            query: {
                'workshop_id': workshopId,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add User To Workshop
     * Add a user to a workshop.
     * @param workshopId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addUserToWorkshopUsersWorkshopsWorkshopIdUsersPost(
        workshopId: string,
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/workshops/{workshop_id}/users/',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Workshop Users
     * List all users in a workshop.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listWorkshopUsersUsersWorkshopsWorkshopIdUsersGet(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/workshops/{workshop_id}/users/',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User
     * Get user by ID.
     * @param userId
     * @returns User Successful Response
     * @throws ApiError
     */
    public static getUserUsersUserIdGet(
        userId: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Delete a user (no authentication required).
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteUserUsersUserIdDelete(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Permissions
     * Get user permissions based on their role.
     * @param userId
     * @returns UserPermissions Successful Response
     * @throws ApiError
     */
    public static getUserPermissionsUsersUserIdPermissionsGet(
        userId: string,
    ): CancelablePromise<UserPermissions> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{user_id}/permissions',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User Status
     * Update user status.
     * @param userId
     * @param status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateUserStatusUsersUserIdStatusPut(
        userId: string,
        status: UserStatus,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{user_id}/status',
            path: {
                'user_id': userId,
            },
            query: {
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Last Active
     * Update user's last active timestamp.
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateLastActiveUsersUserIdLastActivePut(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{user_id}/last-active',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Workshop Participants
     * Get all participants in a workshop.
     * @param workshopId
     * @returns WorkshopParticipant Successful Response
     * @throws ApiError
     */
    public static getWorkshopParticipantsUsersWorkshopsWorkshopIdParticipantsGet(
        workshopId: string,
    ): CancelablePromise<Array<WorkshopParticipant>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/workshops/{workshop_id}/participants',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign Traces To User
     * Assign specific traces to a user for annotation.
     * @param workshopId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignTracesToUserUsersWorkshopsWorkshopIdParticipantsUserIdAssignTracesPost(
        workshopId: string,
        userId: string,
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/workshops/{workshop_id}/participants/{user_id}/assign-traces',
            path: {
                'workshop_id': workshopId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Assigned Traces
     * Get traces assigned to a specific user.
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssignedTracesUsersWorkshopsWorkshopIdParticipantsUserIdAssignedTracesGet(
        workshopId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/workshops/{workshop_id}/participants/{user_id}/assigned-traces',
            path: {
                'workshop_id': workshopId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove User From Workshop
     * Remove a user from a workshop (but keep them in the system).
     * @param workshopId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeUserFromWorkshopUsersWorkshopsWorkshopIdUsersUserIdDelete(
        workshopId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/workshops/{workshop_id}/users/{user_id}',
            path: {
                'workshop_id': workshopId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Auto Assign Annotations
     * Automatically balance annotation assignments across SMEs and participants.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static autoAssignAnnotationsUsersWorkshopsWorkshopIdAutoAssignAnnotationsPost(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/workshops/{workshop_id}/auto-assign-annotations',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Workshop To Dbsql
     * Export all workshop data from SQLite to Databricks DBSQL tables.
     *
     * This endpoint exports:
     * - All tables from the SQLite database
     * - Creates tables in DBSQL if they don't exist
     * - Inserts or overwrites data in DBSQL tables
     * @param workshopId
     * @param requestBody
     * @returns DBSQLExportResponse Successful Response
     * @throws ApiError
     */
    public static exportWorkshopToDbsqlDbsqlExportWorkshopIdExportPost(
        workshopId: string,
        requestBody: DBSQLExportRequest,
    ): CancelablePromise<DBSQLExportResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dbsql-export/{workshop_id}/export',
            path: {
                'workshop_id': workshopId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Dbsql Export Status
     * Get the export status and summary for a workshop.
     * @param workshopId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDbsqlExportStatusDbsqlExportWorkshopIdExportStatusGet(
        workshopId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dbsql-export/{workshop_id}/export-status',
            path: {
                'workshop_id': workshopId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
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
