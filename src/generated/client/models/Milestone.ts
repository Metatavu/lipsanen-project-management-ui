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
 * milestone
 * @export
 * @interface Milestone
 */
export interface Milestone {
    /**
     * 
     * @type {string}
     * @memberof Milestone
     */
    readonly id?: string;
    /**
     * 
     * @type {string}
     * @memberof Milestone
     */
    name: string;
    /**
     * 
     * @type {Date}
     * @memberof Milestone
     */
    startDate: Date;
    /**
     * 
     * @type {Date}
     * @memberof Milestone
     */
    endDate: Date;
    /**
     * 
     * @type {Metadata}
     * @memberof Milestone
     */
    metadata?: Metadata;
}

/**
 * Check if a given object implements the Milestone interface.
 */
export function instanceOfMilestone(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "startDate" in value;
    isInstance = isInstance && "endDate" in value;

    return isInstance;
}

export function MilestoneFromJSON(json: any): Milestone {
    return MilestoneFromJSONTyped(json, false);
}

export function MilestoneFromJSONTyped(json: any, ignoreDiscriminator: boolean): Milestone {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': json['name'],
        'startDate': (new Date(json['startDate'])),
        'endDate': (new Date(json['endDate'])),
        'metadata': !exists(json, 'metadata') ? undefined : MetadataFromJSON(json['metadata']),
    };
}

export function MilestoneToJSON(value?: Milestone | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'startDate': (value.startDate.toISOString().substring(0,10)),
        'endDate': (value.endDate.toISOString().substring(0,10)),
        'metadata': MetadataToJSON(value.metadata),
    };
}

