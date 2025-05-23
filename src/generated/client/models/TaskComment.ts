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
import type { Metadata } from './Metadata';
import {
    MetadataFromJSON,
    MetadataFromJSONTyped,
    MetadataToJSON,
} from './Metadata';

/**
 * Task comment
 * @export
 * @interface TaskComment
 */
export interface TaskComment {
    /**
     * 
     * @type {string}
     * @memberof TaskComment
     */
    readonly id?: string;
    /**
     * 
     * @type {string}
     * @memberof TaskComment
     */
    taskId: string;
    /**
     * IDs of users that the comment affects
     * @type {Array<string>}
     * @memberof TaskComment
     */
    referencedUsers: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof TaskComment
     */
    comment: string;
    /**
     * 
     * @type {Metadata}
     * @memberof TaskComment
     */
    metadata?: Metadata;
}

/**
 * Check if a given object implements the TaskComment interface.
 */
export function instanceOfTaskComment(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "taskId" in value;
    isInstance = isInstance && "referencedUsers" in value;
    isInstance = isInstance && "comment" in value;

    return isInstance;
}

export function TaskCommentFromJSON(json: any): TaskComment {
    return TaskCommentFromJSONTyped(json, false);
}

export function TaskCommentFromJSONTyped(json: any, ignoreDiscriminator: boolean): TaskComment {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'taskId': json['taskId'],
        'referencedUsers': json['referencedUsers'],
        'comment': json['comment'],
        'metadata': !exists(json, 'metadata') ? undefined : MetadataFromJSON(json['metadata']),
    };
}

export function TaskCommentToJSON(value?: TaskComment | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'taskId': value.taskId,
        'referencedUsers': value.referencedUsers,
        'comment': value.comment,
        'metadata': MetadataToJSON(value.metadata),
    };
}

