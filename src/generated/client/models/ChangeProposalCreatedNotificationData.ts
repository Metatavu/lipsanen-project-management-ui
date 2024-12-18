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

import { exists, mapValues } from '../runtime';
/**
 * Additional data for the CHANGE_PROPOSAL_CREATED notification
 * @export
 * @interface ChangeProposalCreatedNotificationData
 */
export interface ChangeProposalCreatedNotificationData {
    /**
     * ID of the change proposal that was created
     * @type {string}
     * @memberof ChangeProposalCreatedNotificationData
     */
    changeProposalId: string;
    /**
     * ID of the task that the change proposal is related to
     * @type {string}
     * @memberof ChangeProposalCreatedNotificationData
     */
    taskId: string;
    /**
     * Name of the task that the change proposal is related to
     * @type {string}
     * @memberof ChangeProposalCreatedNotificationData
     */
    taskName: string;
}

/**
 * Check if a given object implements the ChangeProposalCreatedNotificationData interface.
 */
export function instanceOfChangeProposalCreatedNotificationData(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "changeProposalId" in value;
    isInstance = isInstance && "taskId" in value;
    isInstance = isInstance && "taskName" in value;

    return isInstance;
}

export function ChangeProposalCreatedNotificationDataFromJSON(json: any): ChangeProposalCreatedNotificationData {
    return ChangeProposalCreatedNotificationDataFromJSONTyped(json, false);
}

export function ChangeProposalCreatedNotificationDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChangeProposalCreatedNotificationData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'changeProposalId': json['changeProposalId'],
        'taskId': json['taskId'],
        'taskName': json['taskName'],
    };
}

export function ChangeProposalCreatedNotificationDataToJSON(value?: ChangeProposalCreatedNotificationData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'changeProposalId': value.changeProposalId,
        'taskId': value.taskId,
        'taskName': value.taskName,
    };
}

