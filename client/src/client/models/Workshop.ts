/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkshopPhase } from './WorkshopPhase';
import type { WorkshopStatus } from './WorkshopStatus';
export type Workshop = {
    id: string;
    name: string;
    description?: (string | null);
    facilitator_id: string;
    status?: WorkshopStatus;
    current_phase?: WorkshopPhase;
    completed_phases?: Array<string>;
    discovery_started?: boolean;
    annotation_started?: boolean;
    active_discovery_trace_ids?: Array<string>;
    active_annotation_trace_ids?: Array<string>;
    created_at?: string;
};

