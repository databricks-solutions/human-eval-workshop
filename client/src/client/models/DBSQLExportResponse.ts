/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for DBSQL export operations.
 */
export type DBSQLExportResponse = {
    /**
     * Whether the export was successful
     */
    success: boolean;
    /**
     * Human-readable message about the export
     */
    message: string;
    /**
     * List of exported tables
     */
    tables_exported?: null;
    /**
     * Total number of rows exported
     */
    total_rows?: (number | null);
    /**
     * List of errors encountered during export
     */
    errors?: (Array<string> | null);
};

