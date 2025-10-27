/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
/**
 * Response model for authentication.
 */
export type AuthResponse = {
    user: User;
    is_preconfigured_facilitator?: boolean;
    message: string;
};

