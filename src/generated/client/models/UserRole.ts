/* tslint:disable */
/* eslint-disable */
/**
 * Lipsanen Project Management API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * Role of the task in the connection
 * @export
 */
export const UserRole = {
    Admin: 'ADMIN',
    User: 'USER'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];


export function UserRoleFromJSON(json: any): UserRole {
    return UserRoleFromJSONTyped(json, false);
}

export function UserRoleFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserRole {
    return json as UserRole;
}

export function UserRoleToJSON(value?: UserRole | null): any {
    return value as any;
}

