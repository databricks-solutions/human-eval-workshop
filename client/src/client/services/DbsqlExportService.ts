/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DBSQLExportRequest } from '../models/DBSQLExportRequest';
import type { DBSQLExportResponse } from '../models/DBSQLExportResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DbsqlExportService {
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
}
