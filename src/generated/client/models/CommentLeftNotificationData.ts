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
 * Additional data for the COMMENT_LEFT notification
 * @export
 * @interface CommentLeftNotificationData
 */
export interface CommentLeftNotificationData {
    /**
     * ID of the comment that was left
     * @type {string}
     * @memberof CommentLeftNotificationData
     */
    commentId: string;
    /**
     * ID of the task that the comment is related to
     * @type {string}
     * @memberof CommentLeftNotificationData
     */
    taskId: string;
    /**
     * Name of the task that the comment is related to
     * @type {string}
     * @memberof CommentLeftNotificationData
     */
    taskName: string;
    /**
     * The comment that was left
     * @type {string}
     * @memberof CommentLeftNotificationData
     */
    comment: string;
}

/**
 * Check if a given object implements the CommentLeftNotificationData interface.
 */
export function instanceOfCommentLeftNotificationData(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "commentId" in value;
    isInstance = isInstance && "taskId" in value;
    isInstance = isInstance && "taskName" in value;
    isInstance = isInstance && "comment" in value;

    return isInstance;
}

export function CommentLeftNotificationDataFromJSON(json: any): CommentLeftNotificationData {
    return CommentLeftNotificationDataFromJSONTyped(json, false);
}

export function CommentLeftNotificationDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): CommentLeftNotificationData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'commentId': json['commentId'],
        'taskId': json['taskId'],
        'taskName': json['taskName'],
        'comment': json['comment'],
    };
}

export function CommentLeftNotificationDataToJSON(value?: CommentLeftNotificationData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'commentId': value.commentId,
        'taskId': value.taskId,
        'taskName': value.taskName,
        'comment': value.comment,
    };
}

