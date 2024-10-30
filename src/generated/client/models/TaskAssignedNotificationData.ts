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
 * Additional data for the TASK_ASSIGNED notification
 * @export
 * @interface TaskAssignedNotificationData
 */
export interface TaskAssignedNotificationData {
    /**
     * ID of the task that was assigned
     * @type {string}
     * @memberof TaskAssignedNotificationData
     */
    taskId: string;
    /**
     * Name of the task that was assigned
     * @type {string}
     * @memberof TaskAssignedNotificationData
     */
    taskName: string;
    /**
     * IDs of users that the task was assigned to
     * @type {Array<string>}
     * @memberof TaskAssignedNotificationData
     */
    assigneeIds: Array<string>;
}

/**
 * Check if a given object implements the TaskAssignedNotificationData interface.
 */
export function instanceOfTaskAssignedNotificationData(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "taskId" in value;
    isInstance = isInstance && "taskName" in value;
    isInstance = isInstance && "assigneeIds" in value;

    return isInstance;
}

export function TaskAssignedNotificationDataFromJSON(json: any): TaskAssignedNotificationData {
    return TaskAssignedNotificationDataFromJSONTyped(json, false);
}

export function TaskAssignedNotificationDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): TaskAssignedNotificationData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'taskId': json['taskId'],
        'taskName': json['taskName'],
        'assigneeIds': json['assigneeIds'],
    };
}

export function TaskAssignedNotificationDataToJSON(value?: TaskAssignedNotificationData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'taskId': value.taskId,
        'taskName': value.taskName,
        'assigneeIds': value.assigneeIds,
    };
}
