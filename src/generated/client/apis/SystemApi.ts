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

/**
 * 
 */
export class SystemApi extends runtime.BaseAPI {

    /**
     * Replies ping with pong
     * Replies with pong
     */
    async pingRaw(): Promise<runtime.ApiResponse<string>> {
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
            path: `/v1/system/ping`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Replies ping with pong
     * Replies with pong
     */
    async ping(): Promise<string> {
        const response = await this.pingRaw();
        return await response.value();
    }

    /**
     * Replies ping with pong
     * Replies with pong
     */
    async pingWithHeaders(): Promise<[ string, Headers ]> {
        const response = await this.pingRaw();
        const value = await response.value(); 
        return [ value, response.raw.headers ];
    }

}
