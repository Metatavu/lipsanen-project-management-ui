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
import type { ProjectStatus } from './ProjectStatus';
import {
    ProjectStatusFromJSON,
    ProjectStatusFromJSONTyped,
    ProjectStatusToJSON,
} from './ProjectStatus';

/**
 * Project object
 * @export
 * @interface Project
 */
export interface Project {
    /**
     * 
     * @type {string}
     * @memberof Project
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Project
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof Project
     */
    tocomanId?: number;
    /**
     * 
     * @type {ProjectStatus}
     * @memberof Project
     */
    status: ProjectStatus;
    /**
     * 
     * @type {Metadata}
     * @memberof Project
     */
    metadata?: Metadata;
}

/**
 * Check if a given object implements the Project interface.
 */
export function instanceOfProject(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "status" in value;

    return isInstance;
}

export function ProjectFromJSON(json: any): Project {
    return ProjectFromJSONTyped(json, false);
}

export function ProjectFromJSONTyped(json: any, ignoreDiscriminator: boolean): Project {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': json['name'],
        'tocomanId': !exists(json, 'tocomanId') ? undefined : json['tocomanId'],
        'status': ProjectStatusFromJSON(json['status']),
        'metadata': !exists(json, 'metadata') ? undefined : MetadataFromJSON(json['metadata']),
    };
}

export function ProjectToJSON(value?: Project | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'tocomanId': value.tocomanId,
        'status': ProjectStatusToJSON(value.status),
        'metadata': MetadataToJSON(value.metadata),
    };
}

