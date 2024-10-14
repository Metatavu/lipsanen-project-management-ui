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


import * as runtime from '../runtime';
import {
    Attachment,
    AttachmentFromJSON,
    AttachmentToJSON,
} from '../models';

export interface CreateAttachmentRequest {
    attachment: Attachment;
}

export interface DeleteAttachmentRequest {
    attachmentId: string;
}

export interface FindAttachmentRequest {
    attachmentId: string;
}

export interface ListAttachmentsRequest {
    projectId?: string;
    taskId?: string;
    first?: number;
    max?: number;
}

export interface UpdateAttachmentRequest {
    attachment: Attachment;
    attachmentId: string;
}

/**
 * 
 */
export class AttachmentsApi extends runtime.BaseAPI {

    /**
     * Create a new attachment
     * Create a new attachment
     */
    async createAttachmentRaw(requestParameters: CreateAttachmentRequest): Promise<runtime.ApiResponse<Attachment>> {
        if (requestParameters.attachment === null || requestParameters.attachment === undefined) {
            throw new runtime.RequiredError('attachment','Required parameter requestParameters.attachment was null or undefined when calling createAttachment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/attachments`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: AttachmentToJSON(requestParameters.attachment),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => AttachmentFromJSON(jsonValue));
    }

    /**
     * Create a new attachment
     * Create a new attachment
     */
    async createAttachment(requestParameters: CreateAttachmentRequest): Promise<Attachment> {
        const response = await this.createAttachmentRaw(requestParameters);
        return await response.value();
    }

    /**
     * Create a new attachment
     * Create a new attachment
     */
    async createAttachmentWithHeaders(requestParameters: CreateAttachmentRequest): Promise<[ Attachment, Headers ]> {
        const response = await this.createAttachmentRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Delete an attachment
     * Delete an attachment
     */
    async deleteAttachmentRaw(requestParameters: DeleteAttachmentRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.attachmentId === null || requestParameters.attachmentId === undefined) {
            throw new runtime.RequiredError('attachmentId','Required parameter requestParameters.attachmentId was null or undefined when calling deleteAttachment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/attachments/{attachmentId}`.replace(`{${"attachmentId"}}`, encodeURIComponent(String(requestParameters.attachmentId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete an attachment
     * Delete an attachment
     */
    async deleteAttachment(requestParameters: DeleteAttachmentRequest): Promise<void> {
        await this.deleteAttachmentRaw(requestParameters);
    }

    /**
     * Delete an attachment
     * Delete an attachment
     */
    async deleteAttachmentWithHeaders(requestParameters: DeleteAttachmentRequest): Promise<Headers> {
        const response = await this.deleteAttachmentRaw(requestParameters);
        return response.raw.headers;
    }

    /**
     * Get an attachment
     * Get an attachment
     */
    async findAttachmentRaw(requestParameters: FindAttachmentRequest): Promise<runtime.ApiResponse<Attachment>> {
        if (requestParameters.attachmentId === null || requestParameters.attachmentId === undefined) {
            throw new runtime.RequiredError('attachmentId','Required parameter requestParameters.attachmentId was null or undefined when calling findAttachment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/attachments/{attachmentId}`.replace(`{${"attachmentId"}}`, encodeURIComponent(String(requestParameters.attachmentId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => AttachmentFromJSON(jsonValue));
    }

    /**
     * Get an attachment
     * Get an attachment
     */
    async findAttachment(requestParameters: FindAttachmentRequest): Promise<Attachment> {
        const response = await this.findAttachmentRaw(requestParameters);
        return await response.value();
    }

    /**
     * Get an attachment
     * Get an attachment
     */
    async findAttachmentWithHeaders(requestParameters: FindAttachmentRequest): Promise<[ Attachment, Headers ]> {
        const response = await this.findAttachmentRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Get all attachments
     * Get all attachments
     */
    async listAttachmentsRaw(requestParameters: ListAttachmentsRequest): Promise<runtime.ApiResponse<Array<Attachment>>> {
        const queryParameters: any = {};

        if (requestParameters.projectId !== undefined) {
            queryParameters['projectId'] = requestParameters.projectId;
        }

        if (requestParameters.taskId !== undefined) {
            queryParameters['taskId'] = requestParameters.taskId;
        }

        if (requestParameters.first !== undefined) {
            queryParameters['first'] = requestParameters.first;
        }

        if (requestParameters.max !== undefined) {
            queryParameters['max'] = requestParameters.max;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/attachments`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(AttachmentFromJSON));
    }

    /**
     * Get all attachments
     * Get all attachments
     */
    async listAttachments(requestParameters: ListAttachmentsRequest = {}): Promise<Array<Attachment>> {
        const response = await this.listAttachmentsRaw(requestParameters);
        return await response.value();
    }

    /**
     * Get all attachments
     * Get all attachments
     */
    async listAttachmentsWithHeaders(requestParameters: ListAttachmentsRequest): Promise<[ Array<Attachment>, Headers ]> {
        const response = await this.listAttachmentsRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Update an attachment
     * Update an attachment
     */
    async updateAttachmentRaw(requestParameters: UpdateAttachmentRequest): Promise<runtime.ApiResponse<Attachment>> {
        if (requestParameters.attachment === null || requestParameters.attachment === undefined) {
            throw new runtime.RequiredError('attachment','Required parameter requestParameters.attachment was null or undefined when calling updateAttachment.');
        }

        if (requestParameters.attachmentId === null || requestParameters.attachmentId === undefined) {
            throw new runtime.RequiredError('attachmentId','Required parameter requestParameters.attachmentId was null or undefined when calling updateAttachment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/attachments/{attachmentId}`.replace(`{${"attachmentId"}}`, encodeURIComponent(String(requestParameters.attachmentId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: AttachmentToJSON(requestParameters.attachment),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => AttachmentFromJSON(jsonValue));
    }

    /**
     * Update an attachment
     * Update an attachment
     */
    async updateAttachment(requestParameters: UpdateAttachmentRequest): Promise<Attachment> {
        const response = await this.updateAttachmentRaw(requestParameters);
        return await response.value();
    }

    /**
     * Update an attachment
     * Update an attachment
     */
    async updateAttachmentWithHeaders(requestParameters: UpdateAttachmentRequest): Promise<[ Attachment, Headers ]> {
        const response = await this.updateAttachmentRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

}