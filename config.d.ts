import { InjectionToken } from '@angular/core';
export interface GapiApolloClientOptions {
    uri?: string;
    authorization?: string;
    subscriptionsUri?: any;
}
export declare const GAPI_APOLLO_MODULE_CONFIG: InjectionToken<GapiApolloClientOptions>;
export declare const GAPI_APOLLO_MODULE_DI_CONFIG: GapiApolloClientOptions;
