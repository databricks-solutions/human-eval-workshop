/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type WorkshopParticipant = {
    user_id: string;
    workshop_id: string;
    role: UserRole;
    assigned_traces?: Array<string>;
    annotation_quota?: (number | null);
    joined_at?: string;
};

