/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
/**
 * Model for user invitations.
 */
export type UserInvite = {
    email: string;
    name: string;
    role: UserRole;
    workshop_id: string;
    invited_by: string;
    expires_at: string;
};

