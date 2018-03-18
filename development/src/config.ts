import { NgModule, InjectionToken } from '@angular/core';

export interface GapiApolloClientOptions {
    uri?: string;
    authorization?: string;
    subscriptionsUri?: any;
}

export const GAPI_APOLLO_MODULE_CONFIG = new InjectionToken< GapiApolloClientOptions >( 'apollo.module.config' );

export const GAPI_APOLLO_MODULE_DI_CONFIG = <GapiApolloClientOptions> {
    uri: 'http://localhost:9000',
    subscriptionsUri: 'ws://localhost:9000/subscriptions'
  };
