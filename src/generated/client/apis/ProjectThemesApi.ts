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
    ProjectTheme,
    ProjectThemeFromJSON,
    ProjectThemeToJSON,
} from '../models';

export interface CreateProjectThemeRequest {
    projectTheme: ProjectTheme;
    projectId: string;
}

export interface DeleteProjectThemeRequest {
    projectId: string;
    themeId: string;
}

export interface FindProjectThemeRequest {
    projectId: string;
    themeId: string;
}

export interface ListProjectThemesRequest {
    projectId: string;
}

export interface UpdateProjectThemeRequest {
    projectTheme: ProjectTheme;
    projectId: string;
    themeId: string;
}

/**
 * 
 */
export class ProjectThemesApi extends runtime.BaseAPI {

    /**
     * Create a new Project Theme
     * Create a new Project Theme
     */
    async createProjectThemeRaw(requestParameters: CreateProjectThemeRequest): Promise<runtime.ApiResponse<ProjectTheme>> {
        if (requestParameters.projectTheme === null || requestParameters.projectTheme === undefined) {
            throw new runtime.RequiredError('projectTheme','Required parameter requestParameters.projectTheme was null or undefined when calling createProjectTheme.');
        }

        if (requestParameters.projectId === null || requestParameters.projectId === undefined) {
            throw new runtime.RequiredError('projectId','Required parameter requestParameters.projectId was null or undefined when calling createProjectTheme.');
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
            path: `/v1/projects/{projectId}/themes`.replace(`{${"projectId"}}`, encodeURIComponent(String(requestParameters.projectId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ProjectThemeToJSON(requestParameters.projectTheme),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ProjectThemeFromJSON(jsonValue));
    }

    /**
     * Create a new Project Theme
     * Create a new Project Theme
     */
    async createProjectTheme(requestParameters: CreateProjectThemeRequest): Promise<ProjectTheme> {
        const response = await this.createProjectThemeRaw(requestParameters);
        return await response.value();
    }

    /**
     * Create a new Project Theme
     * Create a new Project Theme
     */
    async createProjectThemeWithHeaders(requestParameters: CreateProjectThemeRequest): Promise<[ ProjectTheme, Headers ]> {
        const response = await this.createProjectThemeRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Delete a project theme
     * Delete a project theme
     */
    async deleteProjectThemeRaw(requestParameters: DeleteProjectThemeRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.projectId === null || requestParameters.projectId === undefined) {
            throw new runtime.RequiredError('projectId','Required parameter requestParameters.projectId was null or undefined when calling deleteProjectTheme.');
        }

        if (requestParameters.themeId === null || requestParameters.themeId === undefined) {
            throw new runtime.RequiredError('themeId','Required parameter requestParameters.themeId was null or undefined when calling deleteProjectTheme.');
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
            path: `/v1/projects/{projectId}/themes/{themeId}`.replace(`{${"projectId"}}`, encodeURIComponent(String(requestParameters.projectId))).replace(`{${"themeId"}}`, encodeURIComponent(String(requestParameters.themeId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a project theme
     * Delete a project theme
     */
    async deleteProjectTheme(requestParameters: DeleteProjectThemeRequest): Promise<void> {
        await this.deleteProjectThemeRaw(requestParameters);
    }

    /**
     * Delete a project theme
     * Delete a project theme
     */
    async deleteProjectThemeWithHeaders(requestParameters: DeleteProjectThemeRequest): Promise<Headers> {
        const response = await this.deleteProjectThemeRaw(requestParameters);
        return response.raw.headers;
    }

    /**
     * Get a project theme
     * Get a project theme
     */
    async findProjectThemeRaw(requestParameters: FindProjectThemeRequest): Promise<runtime.ApiResponse<ProjectTheme>> {
        if (requestParameters.projectId === null || requestParameters.projectId === undefined) {
            throw new runtime.RequiredError('projectId','Required parameter requestParameters.projectId was null or undefined when calling findProjectTheme.');
        }

        if (requestParameters.themeId === null || requestParameters.themeId === undefined) {
            throw new runtime.RequiredError('themeId','Required parameter requestParameters.themeId was null or undefined when calling findProjectTheme.');
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
            path: `/v1/projects/{projectId}/themes/{themeId}`.replace(`{${"projectId"}}`, encodeURIComponent(String(requestParameters.projectId))).replace(`{${"themeId"}}`, encodeURIComponent(String(requestParameters.themeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ProjectThemeFromJSON(jsonValue));
    }

    /**
     * Get a project theme
     * Get a project theme
     */
    async findProjectTheme(requestParameters: FindProjectThemeRequest): Promise<ProjectTheme> {
        const response = await this.findProjectThemeRaw(requestParameters);
        return await response.value();
    }

    /**
     * Get a project theme
     * Get a project theme
     */
    async findProjectThemeWithHeaders(requestParameters: FindProjectThemeRequest): Promise<[ ProjectTheme, Headers ]> {
        const response = await this.findProjectThemeRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Get all projects themes, expected to be a list of 0 or 1 items
     * Get all projects themes
     */
    async listProjectThemesRaw(requestParameters: ListProjectThemesRequest): Promise<runtime.ApiResponse<Array<ProjectTheme>>> {
        if (requestParameters.projectId === null || requestParameters.projectId === undefined) {
            throw new runtime.RequiredError('projectId','Required parameter requestParameters.projectId was null or undefined when calling listProjectThemes.');
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
            path: `/v1/projects/{projectId}/themes`.replace(`{${"projectId"}}`, encodeURIComponent(String(requestParameters.projectId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ProjectThemeFromJSON));
    }

    /**
     * Get all projects themes, expected to be a list of 0 or 1 items
     * Get all projects themes
     */
    async listProjectThemes(requestParameters: ListProjectThemesRequest): Promise<Array<ProjectTheme>> {
        const response = await this.listProjectThemesRaw(requestParameters);
        return await response.value();
    }

    /**
     * Get all projects themes, expected to be a list of 0 or 1 items
     * Get all projects themes
     */
    async listProjectThemesWithHeaders(requestParameters: ListProjectThemesRequest): Promise<[ Array<ProjectTheme>, Headers ]> {
        const response = await this.listProjectThemesRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

    /**
     * Update a project theme
     * Update a project theme
     */
    async updateProjectThemeRaw(requestParameters: UpdateProjectThemeRequest): Promise<runtime.ApiResponse<ProjectTheme>> {
        if (requestParameters.projectTheme === null || requestParameters.projectTheme === undefined) {
            throw new runtime.RequiredError('projectTheme','Required parameter requestParameters.projectTheme was null or undefined when calling updateProjectTheme.');
        }

        if (requestParameters.projectId === null || requestParameters.projectId === undefined) {
            throw new runtime.RequiredError('projectId','Required parameter requestParameters.projectId was null or undefined when calling updateProjectTheme.');
        }

        if (requestParameters.themeId === null || requestParameters.themeId === undefined) {
            throw new runtime.RequiredError('themeId','Required parameter requestParameters.themeId was null or undefined when calling updateProjectTheme.');
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
            path: `/v1/projects/{projectId}/themes/{themeId}`.replace(`{${"projectId"}}`, encodeURIComponent(String(requestParameters.projectId))).replace(`{${"themeId"}}`, encodeURIComponent(String(requestParameters.themeId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: ProjectThemeToJSON(requestParameters.projectTheme),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ProjectThemeFromJSON(jsonValue));
    }

    /**
     * Update a project theme
     * Update a project theme
     */
    async updateProjectTheme(requestParameters: UpdateProjectThemeRequest): Promise<ProjectTheme> {
        const response = await this.updateProjectThemeRaw(requestParameters);
        return await response.value();
    }

    /**
     * Update a project theme
     * Update a project theme
     */
    async updateProjectThemeWithHeaders(requestParameters: UpdateProjectThemeRequest): Promise<[ ProjectTheme, Headers ]> {
        const response = await this.updateProjectThemeRaw(requestParameters);
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

}
