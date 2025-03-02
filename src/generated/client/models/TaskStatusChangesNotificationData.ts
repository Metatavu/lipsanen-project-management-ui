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
import type { TaskStatus } from './TaskStatus';
import {
    TaskStatusFromJSON,
    TaskStatusFromJSONTyped,
    TaskStatusToJSON,
} from './TaskStatus';

/**
 * Additional data for the TASK_STATUS_CHANGED notification
 * @export
 * @interface TaskStatusChangesNotificationData
 */
export interface TaskStatusChangesNotificationData {
    /**
     * ID of the task that was updated
     * @type {string}
     * @memberof TaskStatusChangesNotificationData
     */
    taskId: string;
    /**
     * Name of the task that was assigned
     * @type {string}
     * @memberof TaskStatusChangesNotificationData
     */
    taskName: string;
    /**
     * 
     * @type {TaskStatus}
     * @memberof TaskStatusChangesNotificationData
     */
    newStatus?: TaskStatus;
}

/**
 * Check if a given object implements the TaskStatusChangesNotificationData interface.
 */
export function instanceOfTaskStatusChangesNotificationData(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "taskId" in value;
    isInstance = isInstance && "taskName" in value;

    return isInstance;
}

export function TaskStatusChangesNotificationDataFromJSON(json: any): TaskStatusChangesNotificationData {
    return TaskStatusChangesNotificationDataFromJSONTyped(json, false);
}

export function TaskStatusChangesNotificationDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): TaskStatusChangesNotificationData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'taskId': json['taskId'],
        'taskName': json['taskName'],
        'newStatus': !exists(json, 'newStatus') ? undefined : TaskStatusFromJSON(json['newStatus']),
    };
}

export function TaskStatusChangesNotificationDataToJSON(value?: TaskStatusChangesNotificationData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'taskId': value.taskId,
        'taskName': value.taskName,
        'newStatus': TaskStatusToJSON(value.newStatus),
    };
}

